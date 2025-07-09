/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenWithSecretDto } from '@hedgedoc/commons';
import { FieldNameApiToken, TableApiToken } from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockSelect,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import * as passwordUtils from '../utils/password';
import { ApiTokenService, AUTH_TOKEN_PREFIX } from './api-token.service';

jest.mock('../utils/password');

describe('ApiTokenService', () => {
  const validSecret =
    'gNrv_NJ4FHZ0UFZJQu_q_3i3-GP_d6tELVtkYiMFLkLWNl_dxEmPVAsCNKxP3N3DB9aGBVFYE1iptvw7hFMJvA';
  const validKeyId = '12345678901';
  const userId = 1;
  const label = 'test token';

  let service: ApiTokenService;

  let knexProvider: Provider;
  let tracker: Tracker;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiTokenService, knexProvider],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, authConfigMock],
        }),
        LoggerModule,
      ],
    }).compile();

    service = module.get<ApiTokenService>(ApiTokenService);
  });

  afterEach(() => {
    tracker.reset();
    jest.restoreAllMocks();
  });

  describe('getUserIdForToken', () => {
    describe('fails if', () => {
      it('the keyId has an invalid length', async () => {
        await expect(
          service.getUserIdForToken(
            `${AUTH_TOKEN_PREFIX}.123456789.${validSecret}`,
          ),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is missing', async () => {
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret has an invalid length', async () => {
        await expect(
          service.getUserIdForToken(
            `${AUTH_TOKEN_PREFIX}.${validKeyId}.${'a'.repeat(73)}`,
          ),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the prefix is wrong', async () => {
        await expect(
          service.getUserIdForToken(`hd1.${validKeyId}.${validSecret}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the token contains sections after the secret', async () => {
        await expect(
          service.getUserIdForToken(
            `${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}.extra`,
          ),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the token does not exist in the database', async () => {
        mockSelect(
          tracker,
          [
            FieldNameApiToken.secretHash,
            FieldNameApiToken.userId,
            FieldNameApiToken.validUntil,
          ],
          TableApiToken,
          FieldNameApiToken.id,
          [],
        );
        await expect(
          service.getUserIdForToken(
            `${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`,
          ),
        ).rejects.toThrow(TokenNotValidError);
        expectBindings(tracker, 'select', [[validKeyId]], true);
      });
      it('ensureTokenIsValid does throw error', async () => {
        mockSelect(
          tracker,
          [
            FieldNameApiToken.secretHash,
            FieldNameApiToken.userId,
            FieldNameApiToken.validUntil,
          ],
          TableApiToken,
          FieldNameApiToken.id,
          [
            {
              [FieldNameApiToken.secretHash]: 'foo',
              [FieldNameApiToken.userId]: userId,
              [FieldNameApiToken.validUntil]: 1,
            },
          ],
        );
        jest.spyOn(service, 'ensureTokenIsValid').mockImplementation(() => {
          throw new TokenNotValidError();
        });
        await expect(
          service.getUserIdForToken(
            `${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`,
          ),
        ).rejects.toThrow(TokenNotValidError);
        expectBindings(tracker, 'select', [[validKeyId]], true);
      });
    });
    it('works', async () => {
      mockSelect(
        tracker,
        [
          FieldNameApiToken.secretHash,
          FieldNameApiToken.userId,
          FieldNameApiToken.validUntil,
        ],
        TableApiToken,
        FieldNameApiToken.id,
        [
          {
            [FieldNameApiToken.secretHash]: 'foo',
            [FieldNameApiToken.userId]: userId,
            [FieldNameApiToken.validUntil]: 1,
          },
        ],
      );
      mockUpdate(
        tracker,
        TableApiToken,
        [FieldNameApiToken.lastUsedAt],
        FieldNameApiToken.id,
        1,
      );
      jest.spyOn(service, 'ensureTokenIsValid').mockImplementation(() => {});
      const userByToken = await service.getUserIdForToken(
        `${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`,
      );
      expect(userByToken).toEqual(userId);
      expectBindings(tracker, 'select', [[validKeyId]], true);
    });
  });

  describe('createToken', () => {
    const twoYearsMilliseconds = 2 * 365 * 24 * 60 * 60 * 1000;
    const validUntil = new Date(Date.now() + 3600 * 1000);
    describe('fails if', () => {
      it('user has more than 200 tokens', async () => {
        mockSelect(
          tracker,
          [FieldNameApiToken.id],
          TableApiToken,
          FieldNameApiToken.userId,
          Array(201).fill({
            [FieldNameApiToken.id]: '1',
          }),
        );
        await expect(
          service.createToken(userId, label, validUntil),
        ).rejects.toThrow(TooManyTokensError);
      });
    });
    describe('works', () => {
      let token: ApiTokenWithSecretDto;
      let timeToCheckinMilliseconds: number;
      const mockSecretHash = 'a'.repeat(20);
      const mockTime = new Date();

      beforeEach(() => {
        jest.useFakeTimers().setSystemTime(mockTime);
        jest
          .spyOn(passwordUtils, 'bufferToBase64Url')
          .mockReturnValue(validSecret)
          .mockReturnValue(validKeyId);
        jest
          .spyOn(passwordUtils, 'hashApiToken')
          .mockReturnValue(mockSecretHash);
        token = {} as ApiTokenWithSecretDto;
        timeToCheckinMilliseconds = twoYearsMilliseconds;
        mockSelect(
          tracker,
          [FieldNameApiToken.id],
          TableApiToken,
          FieldNameApiToken.userId,
          [],
        );
        mockInsert(tracker, TableApiToken, [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.secretHash,
          FieldNameApiToken.userId,
          FieldNameApiToken.validUntil,
        ]);
      });
      afterEach(() => {
        expect(token.label).toEqual(label);
        expect(
          new Date(token.validUntil).getTime() -
            (new Date().getTime() + timeToCheckinMilliseconds),
        ).toBeLessThanOrEqual(10000);
        expect(token.lastUsedAt).toBeNull();
        expect(
          token.secret.startsWith(AUTH_TOKEN_PREFIX + '.' + token.keyId),
        ).toBe(true);
        expectBindings(tracker, 'select', [[userId]]);
        expectBindings(tracker, 'insert', [
          [
            mockTime,
            validKeyId,
            label,
            mockSecretHash,
            userId,
            new Date(mockTime.getTime() + timeToCheckinMilliseconds),
          ],
        ]);
        jest.useRealTimers();
      });

      // expect is common in this test group, and therefore called in afterEach instead of each test
      // eslint-disable-next-line jest/expect-expect
      it('without validUntil', async () => {
        token = await service.createToken(userId, label);
      });

      // eslint-disable-next-line jest/expect-expect
      it('with validUntil more than two years in the future', async () => {
        token = await service.createToken(
          userId,
          label,
          new Date(Date.now() + twoYearsMilliseconds + 1000 * 3600 * 24),
        );
      });

      // eslint-disable-next-line jest/expect-expect
      it('with validUntil less than two years in the future', async () => {
        token = await service.createToken(
          userId,
          label,
          new Date(Date.now() + twoYearsMilliseconds / 2),
        );
        timeToCheckinMilliseconds = twoYearsMilliseconds / 2;
      });
    });
  });

  describe('ensureTokenIsValid', () => {
    describe('fails if', () => {
      it('validUntil is in the past', () => {
        expect(() =>
          service.ensureTokenIsValid(
            validSecret,
            '',
            new Date(Date.now() - 1000 * 3600 * 24),
          ),
        ).toThrow(TokenNotValidError);
      });
      it('if checkTokenEquality returns false', () => {
        jest.spyOn(passwordUtils, 'checkTokenEquality').mockReturnValue(false);
        expect(() =>
          service.ensureTokenIsValid(
            validSecret,
            '',
            new Date(Date.now() - 1000 * 3600 * 24),
          ),
        ).toThrow(TokenNotValidError);
      });
    });

    it('works', () => {
      jest.spyOn(passwordUtils, 'checkTokenEquality').mockReturnValue(true);
      expect(() =>
        service.ensureTokenIsValid(
          validSecret,
          '',
          new Date(Date.now() + 1000 * 3600 * 24),
        ),
      ).not.toThrow();
    });
  });
  describe('getTokensOfUserById', () => {
    const validUntil = new Date(Date.now() + 3600 * 1000 * 2);
    const createdAt = new Date(Date.now() - 3600 * 1000);
    const lastUsedAt = new Date(Date.now() + 3600 * 1000);

    it('works', async () => {
      mockSelect(
        tracker,
        [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.lastUsedAt,
          FieldNameApiToken.validUntil,
          FieldNameApiToken.userId,
        ],
        TableApiToken,
        FieldNameApiToken.userId,
        [
          {
            [FieldNameApiToken.id]: validKeyId,
            [FieldNameApiToken.userId]: userId,
            [FieldNameApiToken.label]: label,
            [FieldNameApiToken.validUntil]: validUntil,
            [FieldNameApiToken.createdAt]: createdAt,
            [FieldNameApiToken.lastUsedAt]: lastUsedAt,
          },
        ],
      );
      const tokens = await service.getTokensOfUserById(userId);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([
        {
          label: label,
          userId: userId,
          validUntil: validUntil.toISOString(),
          keyId: validKeyId,
          createdAt: createdAt.toISOString(),
          lastUsedAt: lastUsedAt.toISOString(),
        },
      ]);
      expectBindings(tracker, 'select', [[userId]]);
    });
    it('should return empty array if token for user do not exists', async () => {
      mockSelect(
        tracker,
        [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.lastUsedAt,
          FieldNameApiToken.validUntil,
          FieldNameApiToken.userId,
        ],
        TableApiToken,
        FieldNameApiToken.userId,
        [],
      );
      const tokens = await service.getTokensOfUserById(userId);
      expect(tokens).toHaveLength(0);
      expect(tokens).toEqual([]);
      expectBindings(tracker, 'select', [[userId]]);
    });
  });

  describe('removeToken', () => {
    it('throws if the token is not in the database', async () => {
      mockDelete(
        tracker,
        TableApiToken,
        [FieldNameApiToken.id, FieldNameApiToken.userId],
        0,
      );
      await expect(service.removeToken(validKeyId, userId)).rejects.toThrow(
        NotInDBError,
      );
    });
    it('works', async () => {
      mockDelete(
        tracker,
        TableApiToken,
        [FieldNameApiToken.id, FieldNameApiToken.userId],
        1,
      );
      await service.removeToken(validKeyId, userId);
      expectBindings(tracker, 'delete', [[validKeyId, userId]]);
    });
  });

  describe('removeInvalidTokens', () => {
    it('works', async () => {
      const mockTime = new Date();
      jest.useFakeTimers().setSystemTime(mockTime);
      mockDelete(tracker, TableApiToken, [FieldNameApiToken.validUntil], 1);
      await service.removeInvalidTokens();
      expectBindings(tracker, 'delete', [[mockTime]]);
      jest.useRealTimers();
    });
  });

  describe('auto remove invalid tokens', () => {
    beforeEach(() => {
      jest
        .spyOn(service, 'removeInvalidTokens')
        .mockImplementation(async () => {});
    });

    it('handleCron should call removeInvalidTokens', async () => {
      await service.handleCron();
      expect(service.removeInvalidTokens).toHaveBeenCalledTimes(1);
    });

    it('handleTimeout should call removeInvalidTokens', async () => {
      await service.handleTimeout();
      expect(service.removeInvalidTokens).toHaveBeenCalledTimes(1);
    });
  });
});
