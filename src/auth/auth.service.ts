/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AuthToken } from './auth-token.entity';
import { AuthTokenDto } from './auth-token.dto';
import { AuthTokenWithSecretDto } from './auth-token-with-secret.dto';
import { compare, hash } from 'bcrypt';
import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsoleLoggerService } from '../logger/console-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    @InjectRepository(AuthToken)
    private authTokenRepository: Repository<AuthToken>,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async validateToken(token: string): Promise<User> {
    const parts = token.split('.');
    const accessToken = await this.getAuthToken(parts[0], parts[1]);
    const user = await this.usersService.getUserByUsername(
      accessToken.user.userName,
    );
    if (user) {
      await this.setLastUsedToken(parts[0]);
      return user;
    }
    return null;
  }

  async hashPassword(cleartext: string): Promise<string> {
    // hash the password with bcrypt and 2^16 iterations
    return hash(cleartext, 12);
  }

  async checkPassword(cleartext: string, password: string): Promise<boolean> {
    // hash the password with bcrypt and 2^16 iterations
    return compare(cleartext, password);
  }

  randomBase64UrlString(length = 64): string {
    // This is necessary as the is no base64url encoding in the toString method
    // but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
    // base64url is quite easy buildable from base64
    return randomBytes(length)
      .toString('base64')
      .replace('+', '-')
      .replace('/', '_')
      .replace(/=+$/, '');
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
    until: number,
  ): Promise<AuthTokenWithSecretDto> {
    const user = await this.usersService.getUserByUsername(userName);
    const secret = this.randomBase64UrlString();
    const keyId = this.randomBase64UrlString(8);
    const accessToken = await this.hashPassword(secret);
    let token;
    if (until === 0) {
      token = AuthToken.create(user, identifier, keyId, accessToken);
    } else {
      token = AuthToken.create(user, identifier, keyId, accessToken, until);
    }
    const createdToken = await this.authTokenRepository.save(token);
    return this.toAuthTokenWithSecretDto(createdToken, `${keyId}.${secret}`);
  }

  async setLastUsedToken(keyId: string) {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    accessToken.lastUsed = new Date().getTime();
    await this.authTokenRepository.save(accessToken);
  }

  async getAuthToken(keyId: string, token: string): Promise<AuthToken> {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
      relations: ['user'],
    });
    if (accessToken === undefined) {
      throw new NotInDBError(`AuthToken '${token}' not found`);
    }
    if (!(await this.checkPassword(token, accessToken.accessTokenHash))) {
      // hashes are not the same
      throw new TokenNotValidError(`AuthToken '${token}' is not valid.`);
    }
    if (
      accessToken.validUntil &&
      accessToken.validUntil < new Date().getTime()
    ) {
      // tokens validUntil Date lies in the past
      throw new TokenNotValidError(
        `AuthToken '${token}' is not valid since ${new Date(
          accessToken.validUntil,
        )}.`,
      );
    }
    return accessToken;
  }

  async getTokensByUsername(userName: string): Promise<AuthToken[]> {
    const user = await this.usersService.getUserByUsername(userName, true);
    if (user.authTokens === undefined) {
      return [];
    }
    return user.authTokens;
  }

  async removeToken(userName: string, keyId: string) {
    const user = await this.usersService.getUserByUsername(userName);
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
      keyId: authToken.keyId,
      created: authToken.createdAt.getTime(),
      validUntil: authToken.validUntil,
      lastUsed: authToken.lastUsed,
    };
  }

  toAuthTokenWithSecretDto(
    authToken: AuthToken | null | undefined,
    secret: string,
  ): AuthTokenWithSecretDto | null {
    const tokeDto = this.toAuthTokenDto(authToken);
    return {
      ...tokeDto,
      secret: secret,
    };
  }
}
