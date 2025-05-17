/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import {
  FieldNameIdentity,
  FieldNameUser,
  Identity,
  TableIdentity,
  User,
} from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  OptionsGraph,
  OptionsType,
  zxcvbnAsync,
  zxcvbnOptions,
} from '@zxcvbn-ts/core';
import {
  adjacencyGraphs,
  dictionary as zxcvbnCommonDictionary,
} from '@zxcvbn-ts/language-common';
import {
  dictionary as zxcvbnEnDictionary,
  translations as zxcvbnEnTranslations,
} from '@zxcvbn-ts/language-en';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import authConfiguration, { AuthConfig } from '../../config/auth.config';
import {
  InvalidCredentialsError,
  PasswordTooWeakError,
} from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { checkPassword, hashPassword } from '../../utils/password';
import { IdentityService } from '../identity.service';

@Injectable()
export class LocalService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private identityService: IdentityService,

    @InjectConnection()
    private readonly knex: Knex,

    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(LocalService.name);
    const options: OptionsType = {
      dictionary: {
        ...zxcvbnCommonDictionary,
        ...zxcvbnEnDictionary,
      },
      graphs: adjacencyGraphs as OptionsGraph,
      translations: zxcvbnEnTranslations,
    };
    zxcvbnOptions.setOptions(options);
  }

  /**
   * Create a new identity for internal auth
   *
   * @param username The username of the new identity
   * @param password The password the identity should have
   * @param displayName The display name of the new identity
   * @returns {Identity} the new local identity
   */
  async createLocalIdentity(
    username: string,
    password: string,
    displayName: string,
  ): Promise<User[FieldNameUser.id]> {
    const passwordHash = await hashPassword(password);
    return await this.identityService.createUserWithIdentity(
      AuthProviderType.LOCAL,
      null,
      username,
      username,
      displayName,
      null,
      null,
      passwordHash,
    );
  }

  /**
   * @async
   * Update the internal password of the specified the user
   * @param {User} userId - the user, which identity should be updated
   * @param {string} newPassword - the new password
   * @throws {NoLocalIdentityError} the specified user has no internal identity
   * @return {Identity} the changed identity
   */
  async updateLocalPassword(
    userId: number,
    newPassword: string,
  ): Promise<void> {
    await this.checkPasswordStrength(newPassword);
    const newPasswordHash = await hashPassword(newPassword);
    await this.knex(TableIdentity)
      .update({
        [FieldNameIdentity.passwordHash]: newPasswordHash,
        [FieldNameIdentity.updatedAt]: new Date(),
      })
      .where(FieldNameIdentity.providerType, AuthProviderType.LOCAL)
      .andWhere(FieldNameIdentity.userId, userId);
  }

  /**
   * @async
   * Checks if the user and password combination matches
   * @param {string} username - the user to use
   * @param {string} password - the password to use
   * @throws {InvalidCredentialsError} the password and user do not match
   * @throws {NoLocalIdentityError} the specified user has no internal identity
   */
  async checkLocalPassword(
    username: string,
    password: string,
  ): Promise<Identity> {
    const identity =
      await this.identityService.getIdentityFromUserIdAndProviderType(
        username,
        AuthProviderType.LOCAL,
        null,
      );
    if (
      !(await checkPassword(
        password,
        identity[FieldNameIdentity.passwordHash] ?? '',
      ))
    ) {
      throw new InvalidCredentialsError(
        'Username or password is not correct',
        this.logger.getContext(),
        'checkLocalPassword',
      );
    }
    return identity;
  }

  /**
   * @async
   * Check if the password is strong and long enough.
   * This check is performed against the minimalPasswordStrength of the {@link AuthConfig}.
   * @param {string} password - the password to check
   * @throws {PasswordTooWeakError} the password is too weak
   */
  async checkPasswordStrength(password: string): Promise<void> {
    if (password.length < 6) {
      throw new PasswordTooWeakError();
    }
    const result = await zxcvbnAsync(password);
    if (result.score < this.authConfig.local.minimalPasswordStrength) {
      throw new PasswordTooWeakError();
    }
  }
}
