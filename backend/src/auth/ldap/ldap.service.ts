/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FullUserInfoWithIdDto } from '@hedgedoc/commons';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import LdapAuth from 'ldapauth-fork';

import authConfiguration, {
  AuthConfig,
  LdapConfig,
} from '../../config/auth.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';

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

@Injectable()
export class LdapService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    logger.setContext(LdapService.name);
  }

  /**
   * Try to log in the user with the given credentials.
   *
   * @param ldapConfig {LdapConfig} - the ldap config to use
   * @param username {string} - the username to log in with
   * @param password {string} - the password to log in with
   * @returns {FullUserInfoWithIdDto} - the user info of the user that logged in
   * @throws {UnauthorizedException} - the user has given us incorrect credentials
   * @throws {InternalServerErrorException} - if there are errors that we can't assign to wrong credentials
   * @private
   */
  getUserInfoFromLdap(
    ldapConfig: LdapConfig,
    username: string, // This is not of type Username, because LDAP server may use mixed case usernames
    password: string,
  ): Promise<FullUserInfoWithIdDto> {
    return new Promise<FullUserInfoWithIdDto>((resolve, reject) => {
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
      } as LdapAuth.Options);

      auth.once('error', (error: string | Error) => {
        const exception = this.getLdapException(username, error);
        return reject(exception);
      });
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      auth.on('error', () => {}); // Ignore further errors
      auth.authenticate(
        username,
        password,
        (error, userInfo: Record<string, string>) => {
          auth.close(() => {
            // We don't care about the closing
          });
          if (error) {
            const exception = this.getLdapException(username, error);
            return reject(exception);
          }

          if (!userInfo) {
            return reject(new UnauthorizedException(LDAP_ERROR_MAP['default']));
          }

          let email: string | null = null;
          if (userInfo['mail']) {
            if (Array.isArray(userInfo['mail'])) {
              email = userInfo['mail'][0] as string;
            } else {
              email = userInfo['mail'];
            }
          }

          return resolve({
            email,
            username: username,
            id: userInfo[ldapConfig.userIdField],
            displayName: userInfo[ldapConfig.displayNameField] ?? username,
            photoUrl: null, // TODO LDAP stores images as binaries,
            // we need to convert them into a data-URL or alike
          });
        },
      );
    });
  }

  /**
   * Get and return the correct ldap config from the list of available configs.
   * @param {string}  ldapIdentifier the identifier for the ldap config to be used
   * @returns {LdapConfig} - the ldap config with the given identifier
   * @throws {NotFoundException} - there is no ldap config with the given identifier
   * @private
   */
  getLdapConfig(ldapIdentifier: string): LdapConfig {
    const ldapConfig = this.authConfig.ldap.find(
      (config) => config.identifier === ldapIdentifier,
    );
    if (!ldapConfig) {
      this.logger.warn(
        `The LDAP Config '${ldapIdentifier}' was requested, but doesn't exist`,
      );
      throw new NotFoundException(`There is no ldapConfig '${ldapIdentifier}'`);
    }
    return ldapConfig;
  }

  /**
   * This method transforms the ldap error codes we receive into correct errors.
   * It's very much inspired by https://github.com/vesse/passport-ldapauth/blob/b58c60000a7cc62165b112274b80c654adf59fff/lib/passport-ldapauth/strategy.js#L261
   * @returns {HttpException} - the matching HTTP exception to throw to the client
   * @throws {UnauthorizedException} if error indicates that the user is not allowed to log in
   * @throws {InternalServerErrorException} in every other case
   */
  private getLdapException(
    username: string,
    error: Error | string,
  ): HttpException {
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
    if (
      message !== '' ||
      (typeof error === 'string' && error.startsWith('no such user:'))
    ) {
      this.logger.log(
        `User with username '${username}' could not log in. Reason: ${message}`,
      );
      return new UnauthorizedException(message);
    }

    // Other errors are (most likely) real errors
    return new InternalServerErrorException(error);
  }
}
