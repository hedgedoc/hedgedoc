/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import LdapAuth from 'ldapauth-fork';
import { Strategy, VerifiedCallback } from 'passport-custom';

import authConfiguration, {
  AuthConfig,
  LDAPConfig,
} from '../../config/auth.config';
import { NotInDBError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { UsersService } from '../../users/users.service';
import { makeUsernameLowercase } from '../../utils/username';
import { Identity } from '../identity.entity';
import { IdentityService } from '../identity.service';
import { ProviderType } from '../provider-type.enum';
import { LdapLoginDto } from './ldap-login.dto';

const LDAP_ERROR_MAP: Record<string, string> = {
  /* eslint-disable @typescript-eslint/naming-convention */
  '530': 'Not Permitted to login at this time',
  '531': 'Not permitted to logon at this workstation',
  '532': 'Password expired',
  '533': 'Account disabled',
  '534': 'Account disabled',
  '701': 'Account expired',
  '773': 'User must reset password',
  '775': 'User account locked',
  default: 'Invalid username/password',
  /* eslint-enable @typescript-eslint/naming-convention */
};

interface LdapPathParameters {
  ldapIdentifier: string;
}

@Injectable()
export class LdapAuthGuard extends AuthGuard('ldap') {}

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    private usersService: UsersService,
    private identityService: IdentityService,
  ) {
    super(
      (
        request: Request<LdapPathParameters, unknown, LdapLoginDto>,
        doneCallBack: VerifiedCallback,
      ) => {
        logger.setContext(LdapStrategy.name);
        const ldapIdentifier = request.params.ldapIdentifier.toUpperCase();
        const ldapConfig = this.getLDAPConfig(ldapIdentifier);
        const username = request.body.username;
        const password = request.body.password;
        this.loginWithLDAP(ldapConfig, username, password, doneCallBack);
      },
    );
  }

  /**
   * Try to log in the user with the given credentials.
   * @param ldapConfig {LDAPConfig} - the ldap config to use
   * @param username {string} - the username to login with
   * @param password {string} - the password to login with
   * @param doneCallBack {VerifiedCallback} - the callback to call if the login worked
   * @returns {void}
   * @throws {UnauthorizedException} - the user has given us incorrect credentials
   * @throws {InternalServerErrorException} - if there are errors that we can't assign to wrong credentials
   * @private
   */
  private loginWithLDAP(
    ldapConfig: LDAPConfig,
    username: string, // This is not of type Username, because LDAP server may use mixed case usernames
    password: string,
    doneCallBack: VerifiedCallback,
  ): void {
    // initialize LdapAuth lib
    const auth = new LdapAuth({
      url: ldapConfig.url,
      searchBase: ldapConfig.searchBase,
      searchFilter: ldapConfig.searchFilter,
      searchAttributes: ldapConfig.searchAttributes,
      bindDN: ldapConfig.bindDn,
      bindCredentials: ldapConfig.bindCredentials,
      tlsOptions: {
        ca: ldapConfig.tlsCaCerts,
      },
    });

    auth.once('error', (error) => {
      throw new InternalServerErrorException(error);
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    auth.on('error', () => {}); // Ignore further errors
    auth.authenticate(
      username,
      password,
      (error, user: Record<string, string>) => {
        auth.close(() => {
          // We don't care about the closing
        });
        if (error) {
          try {
            this.handleLDAPError(username, error);
          } catch (error) {
            doneCallBack(error, null);
            return;
          }
        }

        if (!user) {
          doneCallBack(
            new UnauthorizedException(LDAP_ERROR_MAP['default']),
            null,
          );
          return;
        }

        const userId = user[ldapConfig.userIdField];
        try {
          this.createOrUpdateIdentity(userId, ldapConfig, user, username);
          doneCallBack(null, username);
        } catch (error) {
          doneCallBack(error, null);
        }
      },
    );
  }

  private createOrUpdateIdentity(
    userId: string,
    ldapConfig: LDAPConfig,
    user: Record<string, string>,
    username: string, // This is not of type Username, because LDAP server may use mixed case usernames
  ): void {
    this.identityService
      .getIdentityFromUserIdAndProviderType(userId, ProviderType.LDAP)
      .then(async (identity) => {
        await this.updateIdentity(
          identity,
          ldapConfig.displayNameField,
          ldapConfig.profilePictureField,
          user,
        );
        return;
      })
      .catch(async (error) => {
        if (error instanceof NotInDBError) {
          // The user/identity does not yet exist
          const usernameLowercase = makeUsernameLowercase(username); // This ensures ldap user can be given permission via usernames
          const newUser = await this.usersService.createUser(
            usernameLowercase,
            // if there is no displayName we use the username
            user[ldapConfig.displayNameField] ?? username,
          );
          const identity = await this.identityService.createIdentity(
            newUser,
            ProviderType.LDAP,
            userId,
          );
          await this.updateIdentity(
            identity,
            ldapConfig.displayNameField,
            ldapConfig.profilePictureField,
            user,
          );
          return;
        } else {
          throw error;
        }
      });
  }

  /**
   * Get and return the correct ldap config from the list of available configs.
   * @param {string}  ldapIdentifier- the identifier for the ldap config to be used
   * @returns {LDAPConfig} - the ldap config with the given identifier
   * @throws {BadRequestException} - there is no ldap config with the given identifier
   * @private
   */
  private getLDAPConfig(ldapIdentifier: string): LDAPConfig {
    const ldapConfig: LDAPConfig | undefined = this.authConfig.ldap.find(
      (config) => config.identifier === ldapIdentifier,
    );
    if (!ldapConfig) {
      this.logger.warn(
        `The LDAP Config '${ldapIdentifier}' was requested, but doesn't exist`,
      );
      throw new BadRequestException(
        `There is no ldapConfig '${ldapIdentifier}'`,
      );
    }
    return ldapConfig;
  }

  /**
   * @async
   * Update identity with data from the ldap user.
   * @param {Identity} identity - the identity to sync
   * @param {string} displayNameField - the field to be used as a display name
   * @param {string} profilePictureField - the field to be used as a profile picture
   * @param {Record<string, string>} user - the user object from ldap
   * @private
   */
  private async updateIdentity(
    identity: Identity,
    displayNameField: string,
    profilePictureField: string,
    user: Record<string, string>,
  ): Promise<Identity> {
    let email: string | undefined = undefined;
    if (user['mail']) {
      if (Array.isArray(user['mail'])) {
        email = user['mail'][0] as string;
      } else {
        email = user['mail'];
      }
    }
    return await this.identityService.updateIdentity(
      identity,
      user[displayNameField],
      email,
      user[profilePictureField],
    );
  }

  /**
   * This method transforms the ldap error codes we receive into correct errors.
   * It's very much inspired by https://github.com/vesse/passport-ldapauth/blob/b58c60000a7cc62165b112274b80c654adf59fff/lib/passport-ldapauth/strategy.js#L261
   * @throws {UnauthorizedException} if error indicates that the user is not allowed to log in
   * @throws {InternalServerErrorException} in every other cases
   * @private
   */
  private handleLDAPError(username: string, error: Error | string): void {
    // Invalid credentials / user not found are not errors but login failures
    let message = '';
    if (typeof error === 'object') {
      switch (error.name) {
        case 'InvalidCredentialsError': {
          message = 'Invalid username/password';
          const ldapComment = error.message.match(
            /data ([\da-fA-F]*), v[\da-fA-F]*/,
          );
          if (ldapComment && ldapComment[1]) {
            message =
              LDAP_ERROR_MAP[ldapComment[1]] || LDAP_ERROR_MAP['default'];
          }
          break;
        }
        case 'NoSuchObjectError':
          message = 'Bad search base';
          break;
        case 'ConstraintViolationError':
          message = 'Bad search base';
          break;
        default:
          message = 'Invalid username/password';
          break;
      }
    }
    if (message !== '') {
      this.logger.log(
        `User with username '${username}' could not log in. Reason: ${message}`,
      );
      throw new UnauthorizedException(message);
    }

    // Other errors are (most likely) real errors
    throw new InternalServerErrorException(error);
  }
}
