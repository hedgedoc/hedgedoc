/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FullUserInfoDto,
  PendingUserConfirmationDto,
  ProviderType,
} from '@hedgedoc/commons';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import AuthConfiguration, { AuthConfig } from '../config/auth.config';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Identity } from './identity.entity';

@Injectable()
export class IdentityService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(AuthConfiguration.KEY)
    private authConfig: AuthConfig,
    @InjectRepository(Identity)
    private identityRepository: Repository<Identity>,
  ) {
    this.logger.setContext(IdentityService.name);
  }

  /**
   * Determines if the identity should be updated
   *
   * @param authProviderIdentifier The identifier of the auth source
   * @return true if the authProviderIdentifier is the sync source, false otherwise
   */
  mayUpdateIdentity(authProviderIdentifier: string): boolean {
    return this.authConfig.common.syncSource === authProviderIdentifier;
  }

  /**
   * @async
   * Retrieve an identity by userId and providerType.
   * @param {string} userId - the userId of the wanted identity
   * @param {ProviderType} providerType - the providerType of the wanted identity
   * @param {string} providerIdentifier - optional name of the provider if multiple exist
   */
  async getIdentityFromUserIdAndProviderType(
    userId: string,
    providerType: ProviderType,
    providerIdentifier?: string,
  ): Promise<Identity> {
    const identity = await this.identityRepository.findOne({
      where: {
        providerUserId: userId,
        providerType,
        providerIdentifier,
      },
      relations: ['user'],
    });
    if (identity === null) {
      throw new NotInDBError(`Identity for user id '${userId}' not found`);
    }
    return identity;
  }

  /**
   * @async
   * Create a new generic identity.
   * @param {User} user - the user the identity should be added to
   * @param {ProviderType} providerType - the providerType of the identity
   * @param {string} providerIdentifier - the providerIdentifier of the identity
   * @param {string} providerUserId - the userId the identity should have
   * @return {Identity} the new local identity
   */
  async createIdentity(
    user: User,
    providerType: ProviderType,
    providerIdentifier: string,
    providerUserId: string,
  ): Promise<Identity> {
    const identity = Identity.create(user, providerType, providerIdentifier);
    identity.providerUserId = providerUserId;
    return await this.identityRepository.save(identity);
  }

  /**
   * Creates a new user with the given user data and the session data.
   *
   * @param {FullUserInfoDto} sessionUserData The user data from the session
   * @param {PendingUserConfirmationDto} updatedUserData The updated user data from the API
   * @param {ProviderType} authProviderType The type of the auth provider
   * @param {string} authProviderIdentifier The identifier of the auth provider
   * @param {string} providerUserId The id of the user in the auth system
   */
  async createUserWithIdentity(
    sessionUserData: FullUserInfoDto,
    updatedUserData: PendingUserConfirmationDto,
    authProviderType: ProviderType,
    authProviderIdentifier: string,
    providerUserId: string,
  ): Promise<Identity> {
    const profileEditsAllowed = this.authConfig.common.allowProfileEdits;
    const chooseUsernameAllowed = this.authConfig.common.allowChooseUsername;

    const username = (
      chooseUsernameAllowed
        ? updatedUserData.username
        : sessionUserData.username
    ) as Lowercase<string>;
    const displayName = profileEditsAllowed
      ? updatedUserData.displayName
      : sessionUserData.displayName;
    const photoUrl = profileEditsAllowed
      ? updatedUserData.profilePicture
      : sessionUserData.photoUrl;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const user = await this.usersService.createUser(
        username,
        displayName,
        sessionUserData.email,
        photoUrl,
      );
      const identity = await this.createIdentity(
        user,
        authProviderType,
        authProviderIdentifier,
        providerUserId,
      );
      await queryRunner.commitTransaction();
      return identity;
    } catch (error) {
      this.logger.error(
        'Error during user creation:' + String(error),
        'createUserWithIdentity',
      );
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    }
  }
}
