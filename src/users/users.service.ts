/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import {
  FullUserInfoDto,
  UserInfoDto,
  UserLoginInfoDto,
} from './user-info.dto';
import { UserRelationEnum } from './user-relation.enum';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.logger.setContext(UsersService.name);
  }

  /**
   * @async
   * Create a new user with a given username and displayName
   * @param username - the username the new user shall have
   * @param displayName - the display name the new user shall have
   * @return {User} the user
   * @throws {AlreadyInDBError} the username is already taken.
   */
  async createUser(username: string, displayName: string): Promise<User> {
    const user = User.create(username, displayName);
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
   * Change the displayName of the specified user
   * @param {User} user - the user to be changed
   * @param displayName - the new displayName
   */
  async changeDisplayName(user: User, displayName: string): Promise<void> {
    user.displayName = displayName;
    await this.userRepository.save(user);
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
      // TODO: Create new photo, see old code
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
      photo: this.getPhotoUrl(user),
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
      photo: this.getPhotoUrl(user),
      email: user.email ?? '',
    };
  }

  toUserLoginInfoDto(user: User, authProvider: string): UserLoginInfoDto {
    return { ...this.toUserDto(user), authProvider };
  }
}
