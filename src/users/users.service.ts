/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotInDBError, RandomnessError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserInfoDto } from './user-info.dto';
import { User } from './user.entity';
import { AuthToken } from './auth-token.entity';
import { hash } from 'bcrypt'
import crypt from 'crypto';
import { AuthTokenDto } from './auth-token.dto';
import { AuthTokenWithSecretDto } from './auth-token-with-secret.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AuthToken)
    private authTokenRepository: Repository<AuthToken>,
  ) {
    this.logger.setContext(UsersService.name);
  }

  createUser(userName: string, displayName: string): Promise<User> {
    const user = User.create(userName, displayName);
    return this.userRepository.save(user);
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
  ): Promise<AuthToken> {
    const user = await this.getUserByUsername(userName);
    let accessToken = '';
    for (let i = 0; i < 100; i++) {
      try {
        accessToken = crypt.randomBytes(64).toString();
        await this.getUserByAuthToken(accessToken);
      } catch (NotInDBError) {
        const token = AuthToken.create(user, identifier, accessToken);
        return this.authTokenRepository.save(token);
      }
    }
    // This should never happen
    throw new RandomnessError(
      'You machine is not able to generate not-in-use tokens. This should never happen.',
    );
  }

  async deleteUser(userName: string) {
    // TODO: Handle owned notes and edits
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

  async hashPassword(password: string): Promise<string> {
    // hash the password with bcrypt and 2^16 iterations
    return hash(password, 16)
  }

  async getUserByAuthToken(token: string): Promise<User> {
    const hash = this.hashPassword(token);
    const accessToken = await this.authTokenRepository.findOne({
      where: { accessToken: hash },
    });
    if (accessToken === undefined) {
      throw new NotInDBError(`AuthToken '${token}' not found`);
    }
    return this.getUserByUsername(accessToken.user.userName);
  }

  getPhotoUrl(user: User): string {
    if (user.photo) {
      return user.photo;
    } else {
      // TODO: Create new photo, see old code
      return '';
    }
  }

  async getTokensByUsername(userName: string): Promise<AuthToken[]> {
    const user = await this.getUserByUsername(userName);
    return user.authTokens;
  }

  async removeToken(userName: string, timestamp: number) {
    const user = await this.getUserByUsername(userName);
    const token = await this.authTokenRepository.findOne({
      where: { createdAt: new Date(timestamp), user: user },
    });
    await this.authTokenRepository.remove(token);
  }

  toAuthTokenDto(authToken: AuthToken | null | undefined): AuthTokenDto | null {
    if (!authToken) {
      this.logger.warn(`Recieved ${authToken} argument!`, 'toAuthTokenDto');
      return null;
    }
    return {
      label: authToken.identifier,
      created: authToken.createdAt.getTime(),
    };
  }

  toAuthTokenWithSecretDto(
    authToken: AuthToken | null | undefined,
  ): AuthTokenWithSecretDto | null {
    if (!authToken) {
      this.logger.warn(`Recieved ${authToken} argument!`, 'toAuthTokenDto');
      return null;
    }
    return {
      label: authToken.identifier,
      created: authToken.createdAt.getTime(),
      secret: authToken.accessToken,
    };
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
