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
import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { TimestampMillis } from '../utils/timestamp';
import { Cron, Timeout } from '@nestjs/schedule';

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
    if (!secret) {
      throw new TokenNotValidError('Invalid AuthToken format');
    }
    if (secret.length > 72) {
      // Only the first 72 characters of the tokens are considered by bcrypt
      // This should prevent strange corner cases
      // At the very least it won't hurt us
      throw new TokenNotValidError(
        `AuthToken '${secret}' is too long the be a proper token`,
      );
    }
    const accessToken = await this.getAuthTokenAndValidate(keyId, secret);
    await this.setLastUsedToken(keyId);
    return this.usersService.getUserByUsername(accessToken.user.userName);
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
    if (length <= 0) {
      return null;
    }
    return randomBytes(length);
  }

  BufferToBase64Url(text: Buffer): string {
    // This is necessary as the is no base64url encoding in the toString method
    // but as can be seen on https://tools.ietf.org/html/rfc4648#page-7
    // base64url is quite easy buildable from base64
    return text
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
    validUntil: TimestampMillis,
  ): Promise<AuthTokenWithSecretDto> {
    const user = await this.usersService.getUserByUsername(userName, true);
    if (user.authTokens.length >= 200) {
      // This is a very high ceiling unlikely to hinder legitimate usage,
      // but should prevent possible attack vectors
      throw new TooManyTokensError(
        `User '${user.userName}' has already 200 tokens and can't have anymore`,
      );
    }
    const secret = this.BufferToBase64Url(await this.randomString(54));
    const keyId = this.BufferToBase64Url(await this.randomString(8));
    const accessToken = await this.hashPassword(secret);
    let token;
    // Tokens can only be valid for a maximum of 2 years
    const maximumTokenValidity =
      new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000;
    if (validUntil === 0 || validUntil > maximumTokenValidity) {
      token = AuthToken.create(
        user,
        identifier,
        keyId,
        accessToken,
        new Date(maximumTokenValidity),
      );
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
        `AuthToken '${token}' is not valid since ${accessToken.validUntil}.`,
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
      label: authToken.label,
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

  // Delete all non valid tokens  every sunday on 3:00 AM
  @Cron('0 0 3 * * 0')
  async handleCron() {
    return this.removeInvalidTokens();
  }

  // Delete all non valid tokens 5 sec after startup
  @Timeout(5000)
  async handleTimeout() {
    return this.removeInvalidTokens();
  }

  async removeInvalidTokens() {
    const currentTime = new Date().getTime();
    const tokens: AuthToken[] = await this.authTokenRepository.find();
    let removedTokens = 0;
    for (const token of tokens) {
      if (token.validUntil && token.validUntil.getTime() <= currentTime) {
        this.logger.debug(`AuthToken '${token.keyId}' was removed`);
        await this.authTokenRepository.remove(token);
        removedTokens++;
      }
    }
    this.logger.log(
      `${removedTokens} invalid AuthTokens were purged from the DB.`,
    );
  }
}
