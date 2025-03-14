/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { REGEX_USERNAME } from '@hedgedoc/commons';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import AuthConfiguration, { AuthConfig } from '../config/auth.config';
import { FieldNameUser, TableUser, User } from '../database/types';
import { TypeUpdateUser } from '../database/types/user';
import {
  AlreadyInDBError,
  GenericDBError,
  NotInDBError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Username } from '../utils/username';
import { OwnUserInfoDto, UserInfoDto } from './user-info.dto';

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
   * @param [email] New user's email address if exists
   * @param [photoUrl] URL of the user's profile picture if exists
   * @return The newly created user
   * @throws {BadRequestException} if the username contains invalid characters or is too short
   * @throws {AlreadyInDBError} the username is already taken.
   * @thorws {GenericDBError} the database returned a non-expected value
   */
  async createUser(
    username: Username,
    displayName: string,
    email?: string,
    photoUrl?: string,
  ): Promise<User> {
    if (!REGEX_USERNAME.test(username)) {
      throw new BadRequestException(
        `The username '${username}' is not a valid username.`,
      );
    }

    try {
      const newUsers = await this.knex(TableUser).insert(
        {
          [FieldNameUser.username]: username,
          [FieldNameUser.displayName]: displayName,
          [FieldNameUser.email]: email ?? null,
          [FieldNameUser.photoUrl]: photoUrl ?? null,
          [FieldNameUser.guestUuid]: null,
          [FieldNameUser.authorStyle]: 0,
          // FIXME Set unique authorStyle per user
        },
        [
          FieldNameUser.id,
          FieldNameUser.username,
          FieldNameUser.displayName,
          FieldNameUser.email,
          FieldNameUser.photoUrl,
          FieldNameUser.guestUuid,
          FieldNameUser.authorStyle,
          FieldNameUser.createdAt,
        ],
      );
      if (newUsers.length !== 1) {
        throw new GenericDBError(
          `Failed to create user '${username}', no user was created.`,
        );
      }
      return newUsers[0];
    } catch {
      const message = `A user with the username '${username}' already exists.`;
      this.logger.debug(message, 'createUser');
      throw new AlreadyInDBError(message);
    }
  }

  /**
   * Deletes a user by its username
   *
   * @param username Username of the user to be deleted
   * @throws {NotInDBError} the username has no user associated with it
   */
  async deleteUser(username: Username): Promise<void> {
    const usersDeleted = await this.knex(TableUser)
      .where(FieldNameUser.username, username)
      .delete();
    if (usersDeleted === 0) {
      const message = `User with username '${username}' not found`;
      this.logger.debug(message, 'deleteUser');
      throw new NotInDBError(message);
    }
    if (usersDeleted > 1) {
      this.logger.error(
        `Deleted multiple (${usersDeleted}) users with the same username '${username}'. This should never happen!`,
        'deleteUser',
      );
    }
  }

  /**
   * Updates the given User with new information
   * Use {@code null} to clear the stored value (email or profilePicture).
   * Use {@code undefined} to keep the stored value.
   *
   * @param username The username of the user to update
   * @param displayName The new display name
   * @param email The new email address
   * @param profilePicture The new profile picture URL
   */
  async updateUser(
    username: Username,
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
      .where(FieldNameUser.username, username)
      .update(updateData);
    if (result !== 1) {
      const message = `Failed to update user '${username}'.`;
      this.logger.debug(message, 'updateUser');
      throw new NotInDBError(message);
    }
  }

  /**
   * Checks if a given username is already taken
   *
   * @param username The username to check
   * @return true if the user exists, false otherwise
   */
  async isUsernameTaken(username: Username): Promise<boolean> {
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
   * @return true if the user is registered, false otherwise
   */
  async isRegisteredUser(
    userId: User[FieldNameUser.id],
    transaction?: Knex,
  ): Promise<boolean> {
    const dbActor = transaction ? transaction : this.knex;
    const username = await dbActor(TableUser)
      .select(FieldNameUser.username)
      .where(FieldNameUser.id, userId)
      .first();
    return username !== null && username !== undefined;
  }

  /**
   * Fetches the userId for a given username from the database
   *
   * @param username The username to fetch
   * @return The found user object
   * @throws {NotInDBError} if the user could not be found
   */
  async getUserIdByUsername(
    username: Username,
  ): Promise<User[FieldNameUser.id]> {
    const userId = await this.knex(TableUser)
      .select(FieldNameUser.id)
      .where(FieldNameUser.username, username)
      .first();
    if (userId === undefined) {
      throw new NotInDBError(`User with username "${username}" does not exist`);
    }
    return userId[FieldNameUser.id];
  }

  /**
   * Fetches the user object for a given username from the database
   *
   * @param username The username to fetch
   * @return The found user object
   * @throws {NotInDBError} if the user could not be found
   */
  async getUserByUsername(username: Username): Promise<User> {
    const user = await this.knex(TableUser)
      .select()
      .where(FieldNameUser.username, username)
      .first();
    if (!user) {
      throw new NotInDBError(`User with username "${username}" does not exist`);
    }
    return user;
  }

  /**
   * Extract the photoUrl of the user or falls back to libravatar if enabled
   *
   * @param user The user of which to get the photo url
   * @return A URL to the user's profile picture. If the user has no photo and libravatar support is enabled,
   * a URL to that is returned. Otherwise, undefined is returned to indicate that the frontend needs to generate
   * a random avatar image based on the username.
   */
  getPhotoUrl(user: User): string | undefined {
    if (user[FieldNameUser.photoUrl]) {
      return user[FieldNameUser.photoUrl];
    } else {
      // TODO If libravatar is enabled and the user has an email address, use it to fetch the profile picture from there
      //  Otherwise return undefined to let the frontend generate a random avatar image (#5010)
      return undefined;
    }
  }

  /**
   * Build UserInfoDto from a user object
   *
   * @param user The user object to transform
   * @return The built UserInfoDto
   */
  toUserDto(user: User): UserInfoDto {
    if (user[FieldNameUser.username] === null) {
      throw new BadRequestException(
        `Cannot create UserInfoDto from a guest user.`,
      );
    }
    return {
      username: user[FieldNameUser.username],
      displayName:
        user[FieldNameUser.displayName] ??
        (user[FieldNameUser.username] as string),
      photoUrl: this.getPhotoUrl(user),
    };
  }

  /**
   * Builds a DTO for the user used when the user requests their own data
   *
   * @param user The user to fetch their data for
   * @param authProvider The
   * @return The built OwnUserInfoDto
   */
  toOwnUserDto(user: User, authProvider?: string): OwnUserInfoDto {
    return {
      ...this.toUserDto(user),
      email: user[FieldNameUser.email] ?? undefined,
      authProvider,
    };
  }
}
