/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import crypto, { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { User } from '../users/user.entity';
import { bufferToBase64Url } from '../utils/password';
import { TimestampMillis } from '../utils/timestamp';
import {
  PublicAuthTokenDto,
  PublicAuthTokenWithSecretDto,
} from './public-auth-token.dto';
import { PublicAuthToken } from './public-auth-token.entity';

export const AUTH_TOKEN_PREFIX = 'hd2';

@Injectable()
export class PublicAuthTokenService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(PublicAuthToken)
    private authTokenRepository: Repository<PublicAuthToken>,
  ) {
    this.logger.setContext(PublicAuthTokenService.name);
  }

  async validateToken(tokenString: string): Promise<User> {
    const [prefix, keyId, secret, ...rest] = tokenString.split('.');
    if (!keyId || !secret || prefix !== AUTH_TOKEN_PREFIX || rest.length > 0) {
      throw new TokenNotValidError('Invalid AuthToken format');
    }
    if (secret.length != 86) {
      // We always expect 86 characters, as the secret is generated with 64 bytes
      // and then converted to a base64url string
      throw new TokenNotValidError(
        `AuthToken '${tokenString}' has incorrect length`,
      );
    }
    const token = await this.getAuthToken(keyId);
    this.checkToken(secret, token);
    await this.setLastUsedToken(keyId);
    return await token.user;
  }

  createToken(
    user: User,
    identifier: string,
    userDefinedValidUntil: TimestampMillis | undefined,
  ): [Omit<PublicAuthToken, 'id' | 'createdAt'>, string] {
    const secret = bufferToBase64Url(randomBytes(64));
    const keyId = bufferToBase64Url(randomBytes(8));
    // More about the choice of SHA-512 in the dev docs
    const accessTokenHash = crypto
      .createHash('sha512')
      .update(secret)
      .digest('hex');
    // Tokens can only be valid for a maximum of 2 years
    const maximumTokenValidity =
      new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000;
    const isTokenLimitedToMaximumValidity =
      !userDefinedValidUntil ||
      userDefinedValidUntil === 0 ||
      userDefinedValidUntil > maximumTokenValidity;
    const validUntil = isTokenLimitedToMaximumValidity
      ? maximumTokenValidity
      : userDefinedValidUntil;
    const token = PublicAuthToken.create(
      keyId,
      user,
      identifier,
      accessTokenHash,
      new Date(validUntil),
    );
    return [token, secret];
  }

  async addToken(
    user: User,
    identifier: string,
    validUntil: TimestampMillis | undefined,
  ): Promise<PublicAuthTokenWithSecretDto> {
    user.publicAuthTokens = this.getTokensByUser(user);

    if ((await user.publicAuthTokens).length >= 200) {
      // This is a very high ceiling unlikely to hinder legitimate usage,
      // but should prevent possible attack vectors
      throw new TooManyTokensError(
        `User '${user.username}' has already 200 tokens and can't have anymore`,
      );
    }
    const [token, secret] = this.createToken(user, identifier, validUntil);
    const createdToken = (await this.authTokenRepository.save(
      token,
    )) as PublicAuthToken;
    return this.toAuthTokenWithSecretDto(
      createdToken,
      `${AUTH_TOKEN_PREFIX}.${createdToken.keyId}.${secret}`,
    );
  }

  async setLastUsedToken(keyId: string): Promise<void> {
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
    });
    if (token === null) {
      throw new NotInDBError(`AuthToken for key '${keyId}' not found`);
    }
    token.lastUsedAt = new Date();
    await this.authTokenRepository.save(token);
  }

  async getAuthToken(keyId: string): Promise<PublicAuthToken> {
    const token = await this.authTokenRepository.findOne({
      where: { keyId: keyId },
      relations: ['user'],
    });
    if (token === null) {
      throw new NotInDBError(`AuthToken '${keyId}' not found`);
    }
    return token;
  }

  checkToken(secret: string, token: PublicAuthToken): void {
    const userHash = Buffer.from(
      crypto.createHash('sha512').update(secret).digest('hex'),
    );
    const dbHash = Buffer.from(token.hash);
    if (
      // Normally, both hashes have the same length, as they are both SHA512
      // This is only defense-in-depth, as timingSafeEqual throws if the buffers are not of the same length
      userHash.length !== dbHash.length ||
      !crypto.timingSafeEqual(userHash, dbHash)
    ) {
      // hashes are not the same
      throw new TokenNotValidError(
        `Secret does not match Token ${token.label}.`,
      );
    }
    if (token.validUntil && token.validUntil.getTime() < new Date().getTime()) {
      // tokens validUntil Date lies in the past
      throw new TokenNotValidError(
        `AuthToken '${
          token.label
        }' is not valid since ${token.validUntil.toISOString()}.`,
      );
    }
  }

  async getTokensByUser(user: User): Promise<PublicAuthToken[]> {
    const tokens = await this.authTokenRepository.find({
      where: { user: { id: user.id } },
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

  toAuthTokenDto(authToken: PublicAuthToken): PublicAuthTokenDto {
    const tokenDto: PublicAuthTokenDto = {
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
    authToken: PublicAuthToken,
    secret: string,
  ): PublicAuthTokenWithSecretDto {
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
    const tokens: PublicAuthToken[] = await this.authTokenRepository.find();
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
