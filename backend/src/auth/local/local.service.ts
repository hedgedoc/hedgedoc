/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity, Identity, TableIdentity } from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import { OptionsGraph, OptionsType, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import { adjacencyGraphs, dictionary as zxcvbnCommonDictionary } from '@zxcvbn-ts/language-common';
import {
  dictionary as zxcvbnEnDictionary,
  translations as zxcvbnEnTranslations,
} from '@zxcvbn-ts/language-en';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import authConfiguration, { AuthConfig } from '../../config/auth.config';
import { InvalidCredentialsError, PasswordTooWeakError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { dateTimeToDB, getCurrentDateTime } from '../../utils/datetime';
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
   * Creates a new user with an identity for internal auth and returns the id of the newly created user
   *
   * @param username The username of the new identity
   * @param password The password the identity should have
   * @param displayName The display name of the new identity
   * @returns The id of the newly created user
   */
  async createUserWithLocalIdentity(
    username: string,
    password: string,
    displayName: string,
  ): Promise<number> {
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
   * Updates the password hash for the local identity of the specified the user
   *
   * @param userId The user, whose local identity should be updated
   * @param newPassword The new password
   * @throws NoLocalIdentityError if the specified user has no local identity
   * @throws PasswordTooWeakError if the password is too weak
   */
  async updateLocalPassword(userId: number, newPassword: string): Promise<void> {
    await this.checkPasswordStrength(newPassword);
    const newPasswordHash = await hashPassword(newPassword);
    await this.knex(TableIdentity)
      .update({
        [FieldNameIdentity.passwordHash]: newPasswordHash,
        [FieldNameIdentity.updatedAt]: dateTimeToDB(getCurrentDateTime()),
      })
      .where(FieldNameIdentity.providerType, AuthProviderType.LOCAL)
      .andWhere(FieldNameIdentity.userId, userId);
  }

  /**
   * Checks if the user and password combination matches for the local identity and returns the local identity on success
   *
   * @param username The user to use
   * @param password The password to use
   * @returns The identity of the user if the credentials are valid
   * @throws InvalidCredentialsError if the credentials are invalid
   */
  async checkLocalPassword(username: string, password: string): Promise<Identity> {
    const identity = await this.identityService.getIdentityFromUserIdAndProviderType(
      username,
      AuthProviderType.LOCAL,
      null,
    );
    const passwordValid = await checkPassword(
      password,
      identity[FieldNameIdentity.passwordHash] ?? '',
    );
    if (!passwordValid) {
      throw new InvalidCredentialsError(
        'Username or password is not correct',
        this.logger.getContext(),
        'checkLocalPassword',
      );
    }
    return identity;
  }

  /**
   * Checks if the password is strong and long enough
   * This check is performed against the minimalPasswordStrength of the {@link AuthConfig}.
   * The method acts as a guard and therefore throws an error on failure instead of returning a boolean.
   *
   * @param password The password to check
   * @throws PasswordTooWeakError if the password is too weak
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
