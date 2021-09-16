/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UserRelationEnum } from '../users/user-relation.enum';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import {
  bufferToBase64Url,
  checkPassword,
  hashPassword,
} from '../utils/password';
import { TimestampMillis } from '../utils/timestamp';
import { AuthTokenWithSecretDto } from './auth-token-with-secret.dto';
import { AuthTokenDto } from './auth-token.dto';
import { AuthToken } from './auth-token.entity';

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
    return await this.usersService.getUserByUsername(accessToken.user.userName);
  }

  async createTokenForUser(
    userName: string,
    identifier: string,
    validUntil: TimestampMillis,
  ): Promise<AuthTokenWithSecretDto> {
    const user = await this.usersService.getUserByUsername(userName, [
      UserRelationEnum.AUTHTOKENS,
    ]);
    if (user.authTokens.length >= 200) {
      // This is a very high ceiling unlikely to hinder legitimate usage,
      // but should prevent possible attack vectors
      throw new TooManyTokensError(
        `User '${user.userName}' has already 200 tokens and can't have anymore`,
      );
    }
    const secret = bufferToBase64Url(randomBytes(54));
    const keyId = bufferToBase64Url(randomBytes(8));
    const accessToken = await hashPassword(secret);
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
    const createdToken = (await this.authTokenRepository.save(
      token,
    )) as AuthToken;
    return this.toAuthTokenWithSecretDto(createdToken, `${keyId}.${secret}`);
  }

  async setLastUsedToken(keyId: string): Promise<void> {
    const accessToken = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    if (accessToken === undefined) {
      throw new NotInDBError(`AuthToken for key '${keyId}' not found`);
    }
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
    if (!(await checkPassword(token, accessToken.accessTokenHash))) {
      // hashes are not the same
      throw new TokenNotValidError(`AuthToken '${token}' is not valid.`);
    }
    if (
      accessToken.validUntil &&
      accessToken.validUntil.getTime() < new Date().getTime()
    ) {
      // tokens validUntil Date lies in the past
      throw new TokenNotValidError(
        `AuthToken '${token}' is not valid since ${accessToken.validUntil.toISOString()}.`,
      );
    }
    return accessToken;
  }

  async getTokensByUsername(userName: string): Promise<AuthToken[]> {
    const user = await this.usersService.getUserByUsername(userName, [
      UserRelationEnum.AUTHTOKENS,
    ]);
    if (user.authTokens === undefined) {
      return [];
    }
    return user.authTokens;
  }

  async removeToken(keyId: string): Promise<void> {
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    if (token === undefined) {
      throw new NotInDBError(`AuthToken for key '${keyId}' not found`);
    }
    await this.authTokenRepository.remove(token);
  }

  toAuthTokenDto(authToken: AuthToken): AuthTokenDto {
    const tokenDto: AuthTokenDto = {
      label: authToken.label,
      keyId: authToken.keyId,
      createdAt: authToken.createdAt,
      validUntil: authToken.validUntil,
      lastUsed: null,
    };

    if (authToken.lastUsed) {
      tokenDto.lastUsed = new Date(authToken.lastUsed);
    }

    return tokenDto;
  }

  toAuthTokenWithSecretDto(
    authToken: AuthToken,
    secret: string,
  ): AuthTokenWithSecretDto {
    const tokenDto = this.toAuthTokenDto(authToken);
    return {
      ...tokenDto,
      secret: secret,
    };
  }

  // Delete all non valid tokens  every sunday on 3:00 AM
  @Cron('0 0 3 * * 0')
  async handleCron(): Promise<void> {
    return await this.removeInvalidTokens();
  }

  // Delete all non valid tokens 5 sec after startup
  @Timeout(5000)
  async handleTimeout(): Promise<void> {
    return await this.removeInvalidTokens();
  }

  async removeInvalidTokens(): Promise<void> {
    const currentTime = new Date().getTime();
    const tokens: AuthToken[] = await this.authTokenRepository.find();
    let removedTokens = 0;
    for (const token of tokens) {
      if (token.validUntil && token.validUntil.getTime() <= currentTime) {
        this.logger.debug(
          `AuthToken '${token.keyId}' was removed`,
          'removeInvalidTokens',
        );
        await this.authTokenRepository.remove(token);
        removedTokens++;
      }
    }
    this.logger.log(
      `${removedTokens} invalid AuthTokens were purged from the DB.`,
      'removeInvalidTokens',
    );
  }
}
