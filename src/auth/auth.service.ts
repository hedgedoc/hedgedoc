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
import { TimestampMillis } from '../utils/timestamp';

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
    const [keyId, secret] = token.split('.');
    const accessToken = await this.getAuthTokenAndValidate(keyId, secret);
    const user = await this.usersService.getUserByUsername(
      accessToken.user.userName,
    );
    if (user) {
      await this.setLastUsedToken(keyId);
      return user;
    }
    return null;
  }

  async hashPassword(cleartext: string): Promise<string> {
    // hash the password with bcrypt and 2^12 iterations
    // this was decided on the basis of https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt
    return hash(cleartext, 12);
  }

  async checkPassword(cleartext: string, password: string): Promise<boolean> {
    return compare(cleartext, password);
  }

  async randomString(length: number): Promise<Buffer> {
    // This is necessary as the is no base64url encoding in the toString method
    // but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
    // base64url is quite easy buildable from base64
    if (length <= 0) {
      return null;
    }
    return randomBytes(length);
  }

  BufferToBase64Url(text: Buffer): string {
    return text
      .toString('base64')
      .replace('+', '-')
      .replace('/', '_')
      .replace(/=+$/, '');
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
    validUntil: TimestampMillis,
  ): Promise<AuthTokenWithSecretDto> {
    const user = await this.usersService.getUserByUsername(userName);
    const secret = await this.randomString(64);
    const keyId = this.BufferToBase64Url(await this.randomString(8));
    const accessTokenString = await this.hashPassword(secret.toString());
    const accessToken = this.BufferToBase64Url(Buffer.from(accessTokenString));
    let token;
    if (validUntil === 0) {
      token = AuthToken.create(user, identifier, keyId, accessToken);
    } else {
      token = AuthToken.create(
        user,
        identifier,
        keyId,
        accessToken,
        new Date(validUntil),
      );
    }
    const createdToken = await this.authTokenRepository.save(token);
    return this.toAuthTokenWithSecretDto(createdToken, `${keyId}.${secret}`);
  }

  async setLastUsedToken(keyId: string) {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    accessToken.lastUsed = new Date();
    await this.authTokenRepository.save(accessToken);
  }

  async getAuthTokenAndValidate(
    keyId: string,
    token: string,
  ): Promise<AuthToken> {
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
      accessToken.validUntil.getTime() < new Date().getTime()
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

  async removeToken(keyId: string) {
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    await this.authTokenRepository.remove(token);
  }

  toAuthTokenDto(authToken: AuthToken): AuthTokenDto | null {
    if (!authToken) {
      this.logger.warn(`Recieved ${authToken} argument!`, 'toAuthTokenDto');
      return null;
    }
    const tokenDto: AuthTokenDto = {
      lastUsed: null,
      validUntil: null,
      label: authToken.identifier,
      keyId: authToken.keyId,
      createdAt: authToken.createdAt,
    };

    if (authToken.validUntil) {
      tokenDto.validUntil = new Date(authToken.validUntil);
    }

    if (authToken.lastUsed) {
      tokenDto.lastUsed = new Date(authToken.lastUsed);
    }

    return tokenDto;
  }

  toAuthTokenWithSecretDto(
    authToken: AuthToken | null | undefined,
    secret: string,
  ): AuthTokenWithSecretDto | null {
    const tokenDto = this.toAuthTokenDto(authToken);
    return {
      ...tokenDto,
      secret: secret,
    };
  }
}
