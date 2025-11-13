/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType, REGEX_USERNAME } from '@hedgedoc/commons';
import {
  FieldNameUser,
  TableUser,
  TypeUpdateUser,
  User,
} from '@hedgedoc/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { InjectConnection } from 'nest-knexjs';
import { v4 as uuidv4 } from 'uuid';

import { LoginUserInfoDto } from '../dtos/login-user-info.dto';
import { UserInfoDto } from '../dtos/user-info.dto';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { generateRandomName } from './random-word-lists/name-randomizer';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: ConsoleLoggerService,

    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(UsersService.name);
  }

  /**
   * Creates a new user with a given username and displayName
   *
   * @param username New user's username
   * @param displayName New user's displayName
   * @param email New user's email address if exists
   * @param photoUrl URL of the user's profile picture if exists
   * @param transaction The optional transaction to access the db
   * @returns The id of newly created user
   * @throws BadRequestException if the username contains invalid characters or is too short
   * @throws AlreadyInDBError if the username is already taken
   * @thorws GenericDBError if the database returned a non-expected value
   */
  async createUser(
    username: string,
    displayName: string,
    email: string | null,
    photoUrl: string | null,
    transaction?: Knex,
  ): Promise<number> {
    if (!REGEX_USERNAME.test(username)) {
      throw new BadRequestException(
        `The username '${username}' is not a valid username.`,
      );
    }

    const dbActor = transaction ? transaction : this.knex;
    try {
      const newUsers: number[] | Pick<User, FieldNameUser.id>[] = await dbActor(
        TableUser,
      ).insert(
        {
          [FieldNameUser.username]: username,
          [FieldNameUser.displayName]: displayName,
          [FieldNameUser.email]: email ?? null,
          [FieldNameUser.photoUrl]: this.generatePhotoUrl(
            username,
            email,
            photoUrl,
          ),
          // TODO Use generatePhotoUrl method to generate a random avatar image
          [FieldNameUser.guestUuid]: null,
          [FieldNameUser.authorStyle]: this.generateAuthorStyleIndex(username),
          [FieldNameUser.createdAt]: DateTime.utc().toSQL(),
        },
        [FieldNameUser.id],
      );
      if (newUsers.length !== 1) {
        throw new Error('User was not added to the database');
      }
      return typeof newUsers[0] === 'number'
        ? newUsers[0]
        : newUsers[0][FieldNameUser.id];
    } catch {
      throw new GenericDBError(
        `Failed to create user '${username}', no user was created.`,
        this.logger.getContext(),
        'createUser',
      );
    }
  }

  /**
   * Creates a new guest user with a random displayName
   *
   * @returns The guest uuid and the id of the newly created user
   * @throws GenericDBError if the database returned a non-expected value
   */
  async createGuestUser(): Promise<[string, number]> {
    const randomName = generateRandomName();
    const uuid = uuidv4();
    const createdUserIds: number[] | Pick<User, FieldNameUser.id>[] =
      await this.knex(TableUser).insert(
        {
          [FieldNameUser.username]: null,
          [FieldNameUser.displayName]: `Guest ${randomName}`,
          [FieldNameUser.email]: null,
          [FieldNameUser.photoUrl]: null,
          [FieldNameUser.guestUuid]: uuid,
          [FieldNameUser.authorStyle]: this.generateAuthorStyleIndex(uuid),
          [FieldNameUser.createdAt]: DateTime.utc().toSQL(),
        },
        [FieldNameUser.id],
      );
    if (createdUserIds.length !== 1) {
      throw new GenericDBError(
        'Failed to create guest user',
        this.logger.getContext(),
        'createGuestUser',
      );
    }
    const newUserId =
      typeof createdUserIds[0] === 'number'
        ? createdUserIds[0]
        : createdUserIds[0][FieldNameUser.id];
    return [uuid, newUserId];
  }

  /**
   * Deletes a user by its id
   *
   * @param userId id of the user to be deleted
   * @throws NotInDBError if the username has no user associated with it
   */
  async deleteUser(userId: number): Promise<void> {
    const usersDeleted = await this.knex(TableUser)
      .where(FieldNameUser.id, userId)
      .delete();
    if (usersDeleted === 0) {
      throw new NotInDBError(
        `User with id '${userId}' not found`,
        this.logger.getContext(),
        'deletUser',
      );
    }
    if (usersDeleted > 1) {
      this.logger.error(
        `Deleted multiple (${usersDeleted}) users with the same userId '${userId}'. This should never happen!`,
        'deleteUser',
      );
    }
  }

  /**
   * Updates the given User with new information
   * Use {@code null} to clear the stored value (email or profilePicture).
   * Use {@code undefined} to keep the stored value.
   *
   * @param userId The username of the user to update
   * @param displayName The new display name
   * @param email The new email address
   * @param profilePicture The new profile picture URL
   */
  async updateUser(
    userId: number,
    displayName?: string,
    email?: string | null,
    profilePicture?: string | null,
  ): Promise<void> {
    const updateData = {} as TypeUpdateUser;
    if (displayName !== undefined) {
      updateData[FieldNameUser.displayName] = displayName;
    }
    if (email !== undefined) {
      updateData[FieldNameUser.email] = email;
    }
    if (profilePicture !== undefined) {
      updateData[FieldNameUser.photoUrl] = profilePicture;
    }
    if (Object.keys(updateData).length === 0) {
      this.logger.debug('No update data provided.', 'updateUser');
      return;
    }
    const result = await this.knex(TableUser)
      .where(FieldNameUser.id, userId)
      .update(updateData);
    if (result !== 1) {
      throw new NotInDBError(
        `Failed to update user '${userId}'.`,
        this.logger.getContext(),
        'updateUser',
      );
    }
  }

  /**
   * Checks if a given username is already taken
   *
   * @param username The username to check
   * @returns true if the user exists, false otherwise
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    const result = await this.knex(TableUser)
      .select(FieldNameUser.username)
      .where(FieldNameUser.username, username);
    return result.length === 1;
  }

  /**
   * Checks if a given user is a registered user in contrast to a guest user
   *
   * @param userId The id of the user to check
   * @param transaction the optional transaction to access the db
   * @returns true if the user is registered, false otherwise
   */
  async isRegisteredUser(
    userId: User[FieldNameUser.id],
    transaction?: Knex,
  ): Promise<boolean> {
    const dbActor = transaction ? transaction : this.knex;
    const usernameResponse = await dbActor(TableUser)
      .select(FieldNameUser.username)
      .where(FieldNameUser.id, userId)
      .first();
    const username = usernameResponse?.[FieldNameUser.username] ?? null;
    return username !== null;
  }

  /**
   * Fetches the userId for a given username from the database
   *
   * @param username The username to fetch
   * @returns The found user object
   * @throws NotInDBError if the user could not be found
   */
  async getUserIdByUsername(username: string): Promise<number> {
    const userId = await this.knex(TableUser)
      .select(FieldNameUser.id)
      .where(FieldNameUser.username, username)
      .first();
    if (userId === undefined) {
      throw new NotInDBError(
        `User with username "${username}" does not exist`,
        this.logger.getContext(),
        'getUserIdByUsername',
      );
    }
    return userId[FieldNameUser.id];
  }

  /**
   * Fetches the userId for a given guest uuid from the database
   *
   * @param uuid The guest uuid to fetch
   * @returns The found user object
   * @throws NotInDBError if the guest user could not be found
   */
  async getUserIdByGuestUuid(uuid: string): Promise<User[FieldNameUser.id]> {
    const userId = await this.knex(TableUser)
      .select(FieldNameUser.id)
      .where(FieldNameUser.guestUuid, uuid)
      .first();
    if (userId === undefined) {
      throw new NotInDBError(
        `User with uuid "${uuid}" does not exist`,
        this.logger.getContext(),
        'getUserIdByGuestUuid',
      );
    }
    return userId[FieldNameUser.id];
  }

  /**
   * Fetches the user object for a given username from the database
   *
   * @param username The username to fetch
   * @returns The found user object
   * @throws NotInDBError if the user could not be found
   */
  async getUserDtoByUsername(username: string): Promise<UserInfoDto> {
    const user = await this.knex(TableUser)
      .select()
      .where(FieldNameUser.username, username)
      .first();
    if (!user) {
      throw new NotInDBError(`User with username "${username}" does not exist`);
    }
    return UserInfoDto.create({
      username: user[FieldNameUser.username],
      displayName:
        user[FieldNameUser.displayName] ?? user[FieldNameUser.username],
      photoUrl: user[FieldNameUser.photoUrl],
    });
  }

  /**
   * Fetches the user object for a given username from the database
   *
   * @param userId The username to fetch
   * @returns The found user object
   * @throws {NotInDBError} if the user could not be found
   */
  async getUserById(userId: number): Promise<User> {
    const user = await this.knex(TableUser)
      .select()
      .where(FieldNameUser.id, userId)
      .first();
    if (!user) {
      throw new NotInDBError(`User with id "${userId}" does not exist`);
    }
    return user;
  }

  /**
   * Generates the photo url for a user.
   * When a valid photoUrl is provided, it will be used.
   * When an email address is provided and libravatar is enabled, this will be used.
   * Otherwise, a random image will be generated based on the username.
   *
   * @param username The username to use as a seed when generating a random avatar
   * @param email The email address of the user for using livbravatar if configured
   * @param photoUrl The user-provided photo URL
   * @returns A URL to the user's profile picture.
   */
  private generatePhotoUrl(
    username: string,
    email: string | null,
    photoUrl: string | null,
  ): string {
    if (photoUrl && URL.canParse(photoUrl)) {
      return photoUrl;
    }
    if (email && email.length > 0) {
      // TODO Add config option to enable or disable libravatar
      const hash = createHash('sha256')
        .update(email.toLowerCase())
        .digest('hex');
      return `https://seccdn.libravatar.org/avatar/${hash}`;
    }
    // TODO Generate random fallback image (data URL) with the username as seed
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+E8T8ABu4CpDyuE+YAAAAASUVORK5CYII=';
  }

  /**
   * Creates a random author style index based on a hashing of the username
   *
   * @param username The username is used as input for the hash
   * @returns An index between 0 and 8 (including 0 and 8)
   */
  private generateAuthorStyleIndex(username: string): number {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 9);
  }

  /**
   * Builds a DTO for the user used when the user requests their own data
   *
   * @param user The user to fetch their data for
   * @param authProvider The auth provider used for the current login session
   * @returns The built OwnUserInfoDto
   */
  toLoginUserInfoDto(
    user: User,
    authProvider: AuthProviderType,
  ): LoginUserInfoDto {
    return LoginUserInfoDto.create({
      username: user[FieldNameUser.username],
      displayName:
        user[FieldNameUser.displayName] ?? user[FieldNameUser.username],
      photoUrl: user[FieldNameUser.photoUrl],
      email: user[FieldNameUser.email] ?? null,
      authProvider,
    });
  }
}
