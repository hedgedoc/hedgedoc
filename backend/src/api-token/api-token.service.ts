/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenDto, ApiTokenWithSecretDto } from '@hedgedoc/commons';
import {
  ApiToken,
  FieldNameApiToken,
  TableApiToken,
  TypeInsertApiToken,
} from '@hedgedoc/database';
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { randomBytes } from 'crypto';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import {
  bufferToBase64Url,
  checkTokenEquality,
  hashApiToken,
} from '../utils/password';

export const AUTH_TOKEN_PREFIX = 'hd2';

@Injectable()
export class ApiTokenService {
  constructor(
    private readonly logger: ConsoleLoggerService,

    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(ApiTokenService.name);
  }

  /**
   * Validates a given token string and returns the userId if the token is valid
   * The usage of this token is tracked in the database
   *
   * @param tokenString The token string to validate and parse
   * @return The userId associated with the token
   * @throws TokenNotValidError if the token is not valid
   */
  async getUserIdForToken(tokenString: string): Promise<number> {
    const [prefix, keyId, secret, ...rest] = tokenString.split('.');
    if (!keyId || !secret || prefix !== AUTH_TOKEN_PREFIX || rest.length > 0) {
      throw new TokenNotValidError('Invalid API token format');
    }
    if (secret.length != 86) {
      // We always expect 86 characters, as the secret is generated with 64 bytes
      // and then converted to a base64url string
      throw new TokenNotValidError(
        `API token '${tokenString}' has incorrect length`,
      );
    }
    return await this.knex.transaction(async (transaction) => {
      const token = await transaction(TableApiToken)
        .select(
          FieldNameApiToken.secretHash,
          FieldNameApiToken.userId,
          FieldNameApiToken.validUntil,
        )
        .where(FieldNameApiToken.id, keyId)
        .first();
      if (token === undefined) {
        throw new TokenNotValidError('Token not found');
      }

      const tokenHash = token[FieldNameApiToken.secretHash];
      const validUntil = new Date(token[FieldNameApiToken.validUntil]);
      this.ensureTokenIsValid(secret, tokenHash, validUntil);

      await transaction(TableApiToken)
        .update(FieldNameApiToken.lastUsedAt, this.knex.fn.now())
        .where(FieldNameApiToken.id, keyId);

      return token[FieldNameApiToken.userId];
    });
  }

  /**
   * Creates a new API token for the given user
   *
   * @param userId The id of the user to create the token for
   * @param tokenLabel The label of the token
   * @param userDefinedValidUntil Maximum date until the token is valid, will be truncated to 2 years
   * @throws TooManyTokensError if the user already has 200 tokens
   * @returns The created token together with the secret
   */
  async createToken(
    userId: number,
    tokenLabel: string,
    userDefinedValidUntil?: Date,
  ): Promise<ApiTokenWithSecretDto> {
    return await this.knex.transaction(async (transaction) => {
      const existingTokensForUser = await transaction(TableApiToken)
        .select(FieldNameApiToken.id)
        .where(FieldNameApiToken.userId, userId);
      if (existingTokensForUser.length >= 200) {
        // This is a very high ceiling unlikely to hinder legitimate usage,
        // but should prevent possible attack vectors
        throw new TooManyTokensError(
          `User '${userId}' has already 200 API tokens and can't have more`,
        );
      }

      const secret = bufferToBase64Url(randomBytes(64));
      const keyId = bufferToBase64Url(randomBytes(8));
      const accessTokenHash = hashApiToken(secret);
      // Tokens can only be valid for a maximum of 2 years
      const maximumTokenValidity = new Date();
      maximumTokenValidity.setTime(
        maximumTokenValidity.getTime() + 2 * 365 * 24 * 60 * 60 * 1000,
      );
      const isTokenLimitedToMaximumValidity =
        !userDefinedValidUntil || userDefinedValidUntil > maximumTokenValidity;
      const validUntil = isTokenLimitedToMaximumValidity
        ? maximumTokenValidity
        : userDefinedValidUntil;
      const token: TypeInsertApiToken = {
        [FieldNameApiToken.id]: keyId,
        [FieldNameApiToken.label]: tokenLabel,
        [FieldNameApiToken.userId]: userId,
        [FieldNameApiToken.secretHash]: accessTokenHash,
        [FieldNameApiToken.validUntil]: validUntil,
        [FieldNameApiToken.createdAt]: new Date(),
      };
      await this.knex(TableApiToken).insert(token);
      return this.toAuthTokenWithSecretDto(
        {
          ...token,
          [FieldNameApiToken.validUntil]:
            token[FieldNameApiToken.validUntil].toISOString(),
          [FieldNameApiToken.createdAt]:
            token[FieldNameApiToken.createdAt].toISOString(),
          [FieldNameApiToken.lastUsedAt]: null,
        },
        secret,
      );
    });
  }

  /**
   * Ensures that the given token secret is valid for the given token
   * This method does not return any value but throws an error if the token is not valid
   *
   * @param secret The secret to compare against the hash from the database
   * @param tokenHash The hash from the database
   * @param validUntil Expiry of the API token
   * @throws TokenNotValidError if the token is invalid
   */
  ensureTokenIsValid(
    secret: string,
    tokenHash: string,
    validUntil: Date,
  ): void {
    // First, verify token expiry is not in the past (cheap operation)
    if (validUntil.getTime() < new Date().getTime()) {
      throw new TokenNotValidError(
        `Auth token is not valid since ${validUntil.toISOString()}`,
      );
    }

    // Second, verify the secret (costly operation)
    if (!checkTokenEquality(secret, tokenHash)) {
      throw new TokenNotValidError(`Secret does not match token hash`);
    }
  }

  /**
   * Returns all tokens of a user
   *
   * @param userId The id of the user to get the tokens for
   * @return The tokens of the user
   */
  getTokensOfUserById(userId: number): Promise<ApiToken[]> {
    return this.knex(TableApiToken)
      .select()
      .where(FieldNameApiToken.userId, userId);
  }

  /**
   * Removes a token from the database
   *
   * @param keyId The id of the token to remove
   * @param userId The id of the user who owns the token
   * @throws NotInDBError if the token is not found
   */
  async removeToken(keyId: string, userId: number): Promise<void> {
    const numberOfDeletedTokens = await this.knex(TableApiToken)
      .where(FieldNameApiToken.id, keyId)
      .andWhere(FieldNameApiToken.userId, userId)
      .delete();
    if (numberOfDeletedTokens === 0) {
      throw new NotInDBError('Token not found');
    }
  }

  /**
   * Converts an ApiToken to an ApiTokenDto
   *
   * @param apiToken The token to convert
   * @return The converted token
   */
  toAuthTokenDto(apiToken: ApiToken): ApiTokenDto {
    return {
      label: apiToken[FieldNameApiToken.label],
      keyId: apiToken[FieldNameApiToken.id],
      createdAt: new Date(apiToken[FieldNameApiToken.createdAt]).toISOString(),
      validUntil: new Date(
        apiToken[FieldNameApiToken.validUntil],
      ).toISOString(),
      lastUsedAt: apiToken[FieldNameApiToken.lastUsedAt]
        ? new Date(apiToken[FieldNameApiToken.lastUsedAt]).toISOString()
        : null,
    };
  }

  /**
   * Converts an ApiToken to an ApiTokenWithSecretDto
   *
   * @param apiToken The token to convert
   * @param secret The secret of the token
   * @return The converted token
   */
  toAuthTokenWithSecretDto(
    apiToken: ApiToken,
    secret: string,
  ): ApiTokenWithSecretDto {
    const tokenDto = this.toAuthTokenDto(apiToken);
    const fullToken = `${AUTH_TOKEN_PREFIX}.${tokenDto.keyId}.${secret}`;
    return {
      ...tokenDto,
      secret: fullToken,
    };
  }

  // Deletes all invalid tokens every sunday on 3:00 AM
  @Cron('0 0 3 * * 0')
  async handleCron(): Promise<void> {
    return await this.removeInvalidTokens();
  }

  // Delete all invalid tokens 60 sec after startup
  @Timeout(60 * 1000)
  async handleTimeout(): Promise<void> {
    return await this.removeInvalidTokens();
  }

  /**
   * Removes all expired tokens from the database
   * This method is called by the cron job and the timeout
   */
  async removeInvalidTokens(): Promise<void> {
    const numberOfDeletedTokens = await this.knex(TableApiToken)
      .where(FieldNameApiToken.validUntil, '<', new Date())
      .delete();
    this.logger.log(
      `${numberOfDeletedTokens} invalid AuthTokens were purged from the DB.`,
      'removeInvalidTokens',
    );
  }
}
