/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import crypto, { randomBytes } from 'crypto';
import { Equal, Repository } from 'typeorm';

import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { bufferToBase64Url } from '../utils/password';
import { TimestampMillis } from '../utils/timestamp';
import { AuthTokenDto, AuthTokenWithSecretDto } from './auth-token.dto';
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
    if (secret.length != 86) {
      // We always expect 86 characters, as the secret is generated with 64 bytes
      // and then converted to a base64url string
      throw new TokenNotValidError(`AuthToken '${token}' has incorrect length`);
    }
    const accessToken = await this.getAuthTokenAndValidate(keyId, secret);
    await this.setLastUsedToken(keyId);
    return await this.usersService.getUserByUsername(
      (
        await accessToken.user
      ).username,
    );
  }

  async createTokenForUser(
    user: User,
    identifier: string,
    validUntil: TimestampMillis | undefined,
  ): Promise<AuthTokenWithSecretDto> {
    user.authTokens = this.getTokensByUser(user);

    if ((await user.authTokens).length >= 200) {
      // This is a very high ceiling unlikely to hinder legitimate usage,
      // but should prevent possible attack vectors
      throw new TooManyTokensError(
        `User '${user.username}' has already 200 tokens and can't have anymore`,
      );
    }
    const secret = bufferToBase64Url(randomBytes(64));
    const keyId = bufferToBase64Url(randomBytes(8));
    // More about the choice of SHA-512 in the dev docs
    const accessTokenHash = crypto
      .createHash('sha512')
      .update(secret)
      .digest('hex');
    let token;
    // Tokens can only be valid for a maximum of 2 years
    const maximumTokenValidity =
      new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000;
    if (!validUntil || validUntil === 0 || validUntil > maximumTokenValidity) {
      token = AuthToken.create(
        keyId,
        user,
        identifier,
        accessTokenHash,
        new Date(maximumTokenValidity),
      );
    } else {
      token = AuthToken.create(
        keyId,
        user,
        identifier,
        accessTokenHash,
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
    if (accessToken === null) {
      throw new NotInDBError(`AuthToken for key '${keyId}' not found`);
    }
    accessToken.lastUsedAt = new Date();
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
    if (accessToken === null) {
      throw new NotInDBError(`AuthToken '${token}' not found`);
    }
    // Hash the user-provided token
    const userHash = Buffer.from(
      crypto.createHash('sha512').update(token).digest('hex'),
    );
    const dbHash = Buffer.from(accessToken.accessTokenHash);
    if (
      // Normally, both hashes have the same length, as they are both SHA512
      // This is only defense-in-depth, as timingSafeEqual throws if the buffers are not of the same length
      userHash.length !== dbHash.length ||
      !crypto.timingSafeEqual(userHash, dbHash)
    ) {
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

  async getTokensByUser(user: User): Promise<AuthToken[]> {
    const tokens = await this.authTokenRepository.find({
      where: { user: Equal(user) },
    });
    if (tokens === null) {
      return [];
    }
    return tokens;
  }

  async removeToken(keyId: string): Promise<void> {
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    if (token === null) {
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
      lastUsedAt: null,
    };

    if (authToken.lastUsedAt) {
      tokenDto.lastUsedAt = new Date(authToken.lastUsedAt);
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
