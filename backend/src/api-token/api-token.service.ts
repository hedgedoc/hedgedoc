/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenDto, ApiTokenWithSecretDto } from '@hedgedoc/commons';
import { ApiToken, FieldNameApiToken, TableApiToken } from '@hedgedoc/database';
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

const AUTH_TOKEN_PREFIX = 'hd2';
const MESSAGE_TOKEN_INVALID = 'API token is invalid, expired or not found';

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
   * @returns The userId associated with the token
   * @throws TokenNotValidError if the token is not valid
   */
  async getUserIdForToken(tokenString: string): Promise<number> {
    const [prefix, keyId, secret, ...rest] = tokenString.split('.');
    // We always expect 86 characters for the secret and 11 characters for the keyId
    // as they are generated with 64 bytes and 8 bytes respectively and then converted to a base64url string
    if (
      keyId.length !== 11 ||
      !secret ||
      secret.length !== 86 ||
      prefix !== AUTH_TOKEN_PREFIX ||
      rest.length > 0
    ) {
      throw new TokenNotValidError('Invalid API token format');
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
        throw new TokenNotValidError(MESSAGE_TOKEN_INVALID);
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
   * We limit the number of tokens to 200 per user to avoid users losing track over their tokens.
   * There is no technical limit to this.
   *
   * The returned secret is stored hashed in the database and therefore cannot be retrieved again.
   *
   * @param userId The id of the user to create the token for
   * @param label The label of the token
   * @param userDefinedValidUntil Maximum date until the token is valid, will be truncated to 2 years
   * @returns The created token together with the secret
   * @throws TooManyTokensError if the user already has 200 tokens
   */
  async createToken(
    userId: number,
    label: string,
    userDefinedValidUntil?: Date,
  ): Promise<ApiTokenWithSecretDto> {
    return await this.knex.transaction(async (transaction) => {
      const existingTokensForUser = await transaction(TableApiToken)
        .select(FieldNameApiToken.id)
        .where(FieldNameApiToken.userId, userId);
      if (existingTokensForUser.length >= 200) {
        throw new TooManyTokensError(
          'There is a maximum of 200 API tokens per user',
        );
      }

      const secret = bufferToBase64Url(randomBytes(64));
      const keyId = bufferToBase64Url(randomBytes(8));
      const secretHash = hashApiToken(secret);
      const fullToken = `${AUTH_TOKEN_PREFIX}.${keyId}.${secret}`;
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
      const createdAt = new Date();
      await this.knex(TableApiToken).insert({
        [FieldNameApiToken.id]: keyId,
        [FieldNameApiToken.label]: label,
        [FieldNameApiToken.userId]: userId,
        [FieldNameApiToken.secretHash]: secretHash,
        [FieldNameApiToken.validUntil]: validUntil,
        [FieldNameApiToken.createdAt]: createdAt,
      });
      return {
        label,
        keyId,
        createdAt: createdAt.toISOString(),
        validUntil: validUntil.toISOString(),
        lastUsedAt: null,
        secret: fullToken,
      };
    });
  }

  /**
   * Ensures that a token is valid by evaluating the expiry date as well as comparing secret and stored hash
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
      throw new TokenNotValidError(MESSAGE_TOKEN_INVALID);
    }

    // Second, verify the secret (costly operation)
    if (!checkTokenEquality(secret, tokenHash)) {
      throw new TokenNotValidError(MESSAGE_TOKEN_INVALID);
    }
  }

  /**
   * Returns all tokens of a user
   *
   * @param userId The id of the user to get the tokens for
   * @returns A list of the user's tokens as ApiToken objects
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
   * Formats an ApiToken object from the database to an ApiTokenDto
   *
   * @param apiToken The token object to convert
   * @returns The built ApiTokenDto
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
      `${numberOfDeletedTokens} expired API tokens were purged from the DB`,
      'removeInvalidTokens',
    );
  }
}
