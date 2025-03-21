/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FullUserInfoDto,
  LoginUserInfoDto,
  ProviderType,
  REGEX_USERNAME,
  UserInfoDto,
} from '@hedgedoc/commons';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import AuthConfiguration, { AuthConfig } from '../config/auth.config';
import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserRelationEnum } from './user-relation.enum';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(AuthConfiguration.KEY)
    private authConfig: AuthConfig,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.logger.setContext(UsersService.name);
  }

  /**
   * @async
   * Create a new user with a given username and displayName
   * @param {string} username - the username the new user shall have
   * @param {string} displayName - the display name the new user shall have
   * @param {string} [email] - the email the new user shall have
   * @param {string} [photoUrl] - the photoUrl the new user shall have
   * @return {User} the user
   * @throws {BadRequestException} if the username contains invalid characters or is too short
   * @throws {AlreadyInDBError} the username is already taken.
   */
  async createUser(
    username: string,
    displayName: string,
    email: string | null,
    photoUrl: string | null,
  ): Promise<User> {
    if (!REGEX_USERNAME.test(username)) {
      throw new BadRequestException(
        `The username '${username}' is not a valid username.`,
      );
    }
    const user = User.create(
      username,
      displayName,
      email || undefined,
      photoUrl || undefined,
    );
    try {
      return await this.userRepository.save(user);
    } catch {
      this.logger.debug(
        `A user with the username '${username}' already exists.`,
        'createUser',
      );
      throw new AlreadyInDBError(
        `A user with the username '${username}' already exists.`,
      );
    }
  }

  /**
   * @async
   * Delete the user with the specified username
   * @param {User} user - the username of the user to be delete
   * @throws {NotInDBError} the username has no user associated with it.
   */
  async deleteUser(user: User): Promise<void> {
    await this.userRepository.remove(user);
    this.logger.debug(
      `Successfully deleted user with username ${user.username}`,
      'deleteUser',
    );
  }

  /**
   * @async
   * Update the given User with the given information.
   * Use {@code null} to clear the stored value (email or profilePicture).
   * Use {@code undefined} to keep the stored value.
   * @param {User} user - the User to update
   * @param {string | undefined} displayName - the displayName to update the user with
   * @param {string | null | undefined} email - the email to update the user with
   * @param {string | null | undefined} profilePicture - the profilePicture to update the user with
   */
  async updateUser(
    user: User,
    displayName?: string,
    email?: string | null,
    profilePicture?: string | null,
  ): Promise<User> {
    let shouldSave = false;
    if (displayName !== undefined) {
      user.displayName = displayName;
      shouldSave = true;
    }
    if (email !== undefined) {
      user.email = email;
      shouldSave = true;
    }
    if (profilePicture !== undefined) {
      user.photo = profilePicture;
      shouldSave = true;
      // ToDo: handle LDAP images (https://github.com/hedgedoc/hedgedoc/issues/5032)
    }
    if (shouldSave) {
      return await this.userRepository.save(user);
    }
    return user;
  }

  /**
   * @async
   * Checks if the user with the specified username exists
   * @param username - the username to check
   * @return {boolean} true if the user exists, false otherwise
   */
  async checkIfUserExists(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    return user !== null;
  }

  /**
   * @async
   * Get the user specified by the username
   * @param {string} username the username by which the user is specified
   * @param {UserRelationEnum[]} [withRelations=[]] if the returned user object should contain certain relations
   * @return {User} the specified user
   */
  async getUserByUsername(
    username: string,
    withRelations: UserRelationEnum[] = [],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username: username },
      relations: withRelations,
    });
    if (user === null) {
      throw new NotInDBError(`User with username '${username}' not found`);
    }
    return user;
  }

  /**
   * Extract the photoUrl of the user or in case no photo url is present generate a deterministic user photo
   * @param {User} user - the specified User
   * @return the url of the photo
   */
  getPhotoUrl(user: User): string {
    if (user.photo) {
      return user.photo;
    } else {
      return '';
    }
  }

  /**
   * Build UserInfoDto from a user.
   * @param {User=} user - the user to use
   * @return {(UserInfoDto)} the built UserInfoDto
   */
  toUserDto(user: User): UserInfoDto {
    return {
      username: user.username,
      displayName: user.displayName,
      photoUrl: this.getPhotoUrl(user),
    };
  }

  /**
   * Build FullUserInfoDto from a user.
   * @param {User=} user - the user to use
   * @return {(UserInfoDto)} the built FullUserInfoDto
   */
  toFullUserDto(user: User): FullUserInfoDto {
    return {
      username: user.username,
      displayName: user.displayName,
      photoUrl: this.getPhotoUrl(user),
      email: user.email ?? '',
    };
  }

  toLoginUserInfoDto(user: User, authProvider: ProviderType): LoginUserInfoDto {
    return { ...this.toFullUserDto(user), authProvider };
  }
}
