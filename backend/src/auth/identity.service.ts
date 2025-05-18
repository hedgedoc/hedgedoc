/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthProviderType,
  PendingUserConfirmationDto,
  PendingUserInfoDto,
} from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import AuthConfiguration, { AuthConfig } from '../config/auth.config';
import {
  FieldNameIdentity,
  FieldNameUser,
  Identity,
  TableIdentity,
  User,
} from '../database/types';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class IdentityService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,

    @Inject(AuthConfiguration.KEY)
    private authConfig: AuthConfig,

    @InjectConnection()
    private readonly knex: Knex,
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
   * Retrieve an identity from the information received from an auth provider.
   *
   * @param userId - the userId of the wanted identity
   * @param authProviderType - the providerType of the wanted identity
   * @param authProviderIdentifier - optional name of the provider if multiple exist
   * @return
   */
  async getIdentityFromUserIdAndProviderType(
    authProviderUserId: string,
    authProviderType: AuthProviderType,
    authProviderIdentifier: string | null,
  ): Promise<Identity> {
    const identity = await this.knex(TableIdentity)
      .select()
      .where(FieldNameIdentity.providerUserId, authProviderUserId)
      .andWhere(FieldNameIdentity.providerType, authProviderType)
      .andWhere(FieldNameIdentity.providerIdentifier, authProviderIdentifier)
      .first();
    if (identity === undefined) {
      throw new NotInDBError(
        `Identity for user with authProviderUserId '${authProviderUserId}' in provider ${authProviderType} ${authProviderIdentifier} not found`,
      );
    }
    return identity;
  }

  /**
   * Creates a new generic identity.
   *
   * @param userId - the user the identity should be added to
   * @param authProviderType - the providerType of the identity
   * @param authProviderIdentifier - the providerIdentifier of the identity
   * @param authProviderUserId - the userId the identity should have
   * @param passwordHash - the password hash if the identiy uses that.
   * @param transaction - the database transaction to use if any
   * @return the new local identity
   */
  async createIdentity(
    userId: number,
    authProviderType: AuthProviderType,
    authProviderIdentifier: string | null,
    authProviderUserId: string,
    passwordHash?: string,
    transaction?: Knex,
  ): Promise<void> {
    const dbActor = transaction ?? this.knex;
    const date = new Date();
    const identity: Identity = {
      [FieldNameIdentity.userId]: userId,
      [FieldNameIdentity.providerType]: authProviderType,
      [FieldNameIdentity.providerIdentifier]: authProviderIdentifier,
      [FieldNameIdentity.providerUserId]: authProviderUserId,
      [FieldNameIdentity.passwordHash]: passwordHash ?? null,
      [FieldNameIdentity.createdAt]: date,
      [FieldNameIdentity.updatedAt]: date,
    };
    await dbActor(TableIdentity).insert(identity);
  }

  /**
   * Creates a new user with the given user data.
   *
   * @param authProviderType The type of the auth provider
   * @param authProviderIdentifier The identifier of the auth provider
   * @param authProviderUserId The id of the user in the auth system
   * @param username The new username
   * @param displayName The dispay name of the new user
   * @param email The email address of the new user
   * @param photoUrl The URL to the new user's profile picture
   * @param passwordHash The optional password hash, only required for local identities
   * @return The id of the newly created user
   */
  async createUserWithIdentity(
    authProviderType: AuthProviderType,
    authProviderIdentifier: string | null,
    authProviderUserId: string,
    username: string,
    displayName: string,
    email: string | null,
    photoUrl: string | null,
    passwordHash?: string,
  ): Promise<User[FieldNameUser.id]> {
    return await this.knex.transaction(async (transaction) => {
      const userId = await this.usersService.createUser(
        username,
        displayName,
        email,
        photoUrl,
        transaction,
      );
      await this.createIdentity(
        userId,
        authProviderType,
        authProviderIdentifier,
        authProviderUserId,
        passwordHash,
        transaction,
      );
      return userId;
    });
  }

  /**
   * Create a user with identity from pending user confirmation data.
   *
   * @param sessionUserData The data we got from the authProvider itself
   * @param pendingUserConfirmationData The data the user entered while confirming their account
   * @param authProviderType The type of the auth provider
   * @param authProviderIdentifier The identifier of the auth provider
   * @param authProviderUserId The id of the user in the auth system
   * @return The id of the newly created user
   */
  async createUserWithIdentityFromPendingUserConfirmation(
    sessionUserData: PendingUserInfoDto,
    pendingUserConfirmationData: PendingUserConfirmationDto,
    authProviderType: AuthProviderType,
    authProviderIdentifier: string,
    authProviderUserId: string,
  ): Promise<User[FieldNameUser.id]> {
    const profileEditsAllowed = this.authConfig.common.allowProfileEdits;
    const chooseUsernameAllowed = this.authConfig.common.allowChooseUsername;

    const username = chooseUsernameAllowed
      ? pendingUserConfirmationData.username
      : sessionUserData.username;

    const displayName = profileEditsAllowed
      ? pendingUserConfirmationData.displayName
      : sessionUserData.displayName;

    const photoUrl = profileEditsAllowed
      ? pendingUserConfirmationData.profilePicture
      : sessionUserData.photoUrl;

    return await this.createUserWithIdentity(
      authProviderType,
      authProviderIdentifier,
      authProviderUserId,
      username,
      displayName,
      sessionUserData.email,
      photoUrl,
    );
  }
}
