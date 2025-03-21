/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { Repository } from 'typeorm';

import authConfiguration, { AuthConfig } from '../../config/auth.config';
import {
  InvalidCredentialsError,
  NoLocalIdentityError,
  PasswordTooWeakError,
} from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { User } from '../../users/user.entity';
import { checkPassword, hashPassword } from '../../utils/password';
import { Identity } from '../identity.entity';
import { IdentityService } from '../identity.service';

@Injectable()
export class LocalService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private identityService: IdentityService,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
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
   * @async
   * Create a new identity for internal auth
   * @param {User} user - the user the identity should be added to
   * @param {string} password - the password the identity should have
   * @return {Identity} the new local identity
   */
  async createLocalIdentity(user: User, password: string): Promise<Identity> {
    const identity = Identity.create(user, ProviderType.LOCAL, null);
    identity.passwordHash = await hashPassword(password);
    identity.providerUserId = user.username;
    return await this.identityRepository.save(identity);
  }

  /**
   * @async
   * Update the internal password of the specified the user
   * @param {User} user - the user, which identity should be updated
   * @param {string} newPassword - the new password
   * @throws {NoLocalIdentityError} the specified user has no internal identity
   * @return {Identity} the changed identity
   */
  async updateLocalPassword(
    user: User,
    newPassword: string,
  ): Promise<Identity> {
    const internalIdentity: Identity | undefined =
      await this.identityService.getIdentityFromUserIdAndProviderType(
        user.username,
        ProviderType.LOCAL,
      );
    if (internalIdentity === undefined) {
      this.logger.debug(
        `The user with the username ${user.username} does not have a internal identity.`,
        'updateLocalPassword',
      );
      throw new NoLocalIdentityError('This user has no internal identity.');
    }
    await this.checkPasswordStrength(newPassword);
    internalIdentity.passwordHash = await hashPassword(newPassword);
    return await this.identityRepository.save(internalIdentity);
  }

  /**
   * @async
   * Checks if the user and password combination matches
   * @param {User} user - the user to use
   * @param {string} password - the password to use
   * @throws {InvalidCredentialsError} the password and user do not match
   * @throws {NoLocalIdentityError} the specified user has no internal identity
   */
  async checkLocalPassword(user: User, password: string): Promise<void> {
    const internalIdentity: Identity | undefined =
      await this.identityService.getIdentityFromUserIdAndProviderType(
        user.username,
        ProviderType.LOCAL,
      );
    if (internalIdentity === undefined) {
      this.logger.debug(
        `The user with the username ${user.username} does not have an internal identity.`,
        'checkLocalPassword',
      );
      throw new NoLocalIdentityError('This user has no internal identity.');
    }
    if (!(await checkPassword(password, internalIdentity.passwordHash ?? ''))) {
      this.logger.debug(
        `Password check for ${user.username} did not succeed.`,
        'checkLocalPassword',
      );
      throw new InvalidCredentialsError('Password is not correct');
    }
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
