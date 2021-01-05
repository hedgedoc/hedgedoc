/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserInfoDto } from './user-info.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.logger.setContext(UsersService.name);
  }

  createUser(userName: string, displayName: string): Promise<User> {
    const user = User.create(userName, displayName);
    return this.userRepository.save(user);
  }

  async deleteUser(userName: string) {
    //TOOD: Handle owned notes and edits
    const user = await this.userRepository.findOne({
      where: { userName: userName },
    });
    await this.userRepository.delete(user);
  }

  async getUserByUsername(userName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userName: userName },
    });
    if (user === undefined) {
      throw new NotInDBError(`User with username '${userName}' not found`);
    }
    return user;
  }

  getPhotoUrl(user: User): string {
    if (user.photo) {
      return user.photo;
    } else {
      // TODO: Create new photo, see old code
      return '';
    }
  }

  toUserDto(user: User | null | undefined): UserInfoDto | null {
    if (!user) {
      this.logger.warn(`Recieved ${user} argument!`, 'toUserDto');
      return null;
    }
    return {
      userName: user.userName,
      displayName: user.displayName,
      photo: this.getPhotoUrl(user),
      email: user.email,
    };
  }
}
