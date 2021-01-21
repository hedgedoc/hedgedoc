/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotInDBError, TokenNotValid } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserInfoDto } from './user-info.dto';
import { User } from './user.entity';
import { AuthToken } from './auth-token.entity';
import { hash, compare } from 'bcrypt';
import { randomBytes } from 'crypto';
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

  randomBase64UrlString(): string {
    // This is necessary as the is no base64url encoding in the toString method
    // but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
    // base64url is quite easy buildable from base64
    return randomBytes(64)
      .toString('base64')
      .replace('+', '-')
      .replace('/', '_')
      .replace(/=+$/, '');
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
    until: number,
  ): Promise<AuthToken> {
    const user = await this.getUserByUsername(userName);
    const secret = this.randomBase64UrlString();
    const keyId = this.randomBase64UrlString();
    const accessToken = await this.hashPassword(secret);
    let token;
    if (until === 0) {
      token = AuthToken.create(user, identifier, keyId, accessToken);
    } else {
      token = AuthToken.create(user, identifier, keyId, accessToken, until);
    }
    const createdToken = await this.authTokenRepository.save(token);
    return {
      ...createdToken,
      accessToken: `${keyId}.${secret}`,
    };
  }

  async deleteUser(userName: string) {
    // TODO: Handle owned notes and edits
    const user = await this.userRepository.findOne({
      where: { userName: userName },
    });
    await this.userRepository.delete(user);
  }

  async getUserByUsername(userName: string, withTokens = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userName: userName },
      relations: withTokens ? ['authTokens'] : null,
    });
    if (user === undefined) {
      throw new NotInDBError(`User with username '${userName}' not found`);
    }
    return user;
  }

  async hashPassword(cleartext: string): Promise<string> {
    // hash the password with bcrypt and 2^16 iterations
    return hash(cleartext, 16);
  }

  async checkPassword(cleartext: string, password: string): Promise<boolean> {
    // hash the password with bcrypt and 2^16 iterations
    return compare(cleartext, password);
  }

  async setLastUsedToken(keyId: string) {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    accessToken.lastUsed = new Date().getTime();
    await this.authTokenRepository.save(accessToken);
  }

  async getUserByAuthToken(keyId: string, token: string): Promise<User> {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
      relations: ['user'],
    });
    if (accessToken === undefined) {
      throw new NotInDBError(`AuthToken '${token}' not found`);
    }
    if (!(await this.checkPassword(token, accessToken.accessToken))) {
      // hashes are not the same
      throw new TokenNotValid(`AuthToken '${token}' is not valid.`);
    }
    if (
      accessToken.validUntil &&
      accessToken.validUntil < new Date().getTime()
    ) {
      // tokens validUntil Date lies in the past
      throw new TokenNotValid(
        `AuthToken '${token}' is not valid since ${new Date(
          accessToken.validUntil,
        )}.`,
      );
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
    const user = await this.getUserByUsername(userName, true);
    if (user.authTokens === undefined) {
      return [];
    }
    return user.authTokens;
  }

  async removeToken(userName: string, keyId: string) {
    const user = await this.getUserByUsername(userName);
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId, user: user },
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
      validUntil: authToken.validUntil,
      lastUsed: authToken.lastUsed,
    };
  }

  toAuthTokenWithSecretDto(
    authToken: AuthToken | null | undefined,
  ): AuthTokenWithSecretDto | null {
    const tokeDto = this.toAuthTokenDto(authToken)
    return {
      ...tokeDto,
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
