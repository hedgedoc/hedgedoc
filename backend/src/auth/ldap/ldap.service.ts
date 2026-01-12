/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { PendingLdapUserInfoDto } from '../../dtos/pending-ldap-user-info.dto';
import { ConsoleLoggerService } from '../../logger/console-logger.service';

const LDAP_ERROR_MAP: Record<string, string> = {
  /* oxlint-disable @typescript-eslint/naming-convention */
  '530': 'Not Permitted to login at this time',
  '531': 'Not permitted to logon at this workstation',
  '532': 'Password expired',
  '533': 'Account disabled',
  '534': 'Account disabled',
  '701': 'Account expired',
  '773': 'User must reset password',
  '775': 'User account locked',
  default: 'Invalid username/password',
  /* oxlint-enable @typescript-eslint/naming-convention */
} as const;

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
   * Tries to log in the user with the given credentials and returns the user info on success
   *
   * @param ldapConfig The ldap config to use
   * @param username The user-provided username
   * @param password The user-provided password
   * @returns The user info of the user that logged in
   * @throws UnauthorizedException if the user has given us incorrect credentials
   * @throws InternalServerErrorException if there are errors that we can't assign to wrong credentials
   */
  getUserInfoFromLdap(
    ldapConfig: LdapConfig,
    username: string, // This is not of type Username, because LDAP server may use mixed case usernames
    password: string,
  ): Promise<PendingLdapUserInfoDto> {
    return new Promise<PendingLdapUserInfoDto>((resolve, reject) => {
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
      // oxlint-disable-next-line @typescript-eslint/no-empty-function
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

          return resolve(
            PendingLdapUserInfoDto.create({
              email,
              username: username,
              id: userInfo[ldapConfig.userIdField],
              displayName: userInfo[ldapConfig.displayNameField] ?? username,
              photoUrl: null,
              // TODO LDAP stores images as binaries, we need to upload them to the media backend
              // https://github.com/hedgedoc/hedgedoc/issues/5032
            }),
          );
        },
      );
    });
  }

  /**
   * Fetches the correct LDAP config from the list of available configs
   *
   * @param ldapIdentifier The identifier for the LDAP config to be used
   * @returns The LDAP config with the given identifier
   * @throws NotFoundException if there is no LDAP config with the given identifier
   */
  getLdapConfig(ldapIdentifier: string): LdapConfig {
    const ldapConfig = this.authConfig.ldap.find(
      (config) => config.identifier === ldapIdentifier,
    );
    if (!ldapConfig) {
      this.logger.warn(
        `The LDAP config '${ldapIdentifier}' was requested, but doesn't exist`,
      );
      throw new NotFoundException(
        `There is no LDAP config '${ldapIdentifier}'`,
      );
    }
    return ldapConfig;
  }

  /**
   * This method transforms the LDAP error codes we receive into correct errors.
   * It's very much inspired by https://github.com/vesse/passport-ldapauth/blob/b58c60000a7cc62165b112274b80c654adf59fff/lib/passport-ldapauth/strategy.js#L261
   *
   * @returns The matching HTTP exception to throw to the client
   * @throws UnauthorizedException if the error indicates that the user is not allowed to log in
   * @throws InternalServerErrorException in every other case
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
