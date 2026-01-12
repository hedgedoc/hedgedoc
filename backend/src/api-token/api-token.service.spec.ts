/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameApiToken, TableApiToken } from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import { mockDelete, mockInsert, mockSelect, mockUpdate } from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { ApiTokenWithSecretDto } from '../dtos/api-token-with-secret.dto';
import { NotInDBError, TokenNotValidError, TooManyTokensError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { dateTimeToDB, getCurrentDateTime, isoStringToDateTime } from '../utils/datetime';
import * as passwordUtils from '../utils/password';
import { ApiTokenService, AUTH_TOKEN_PREFIX } from './api-token.service';

jest.mock('../utils/password');

describe('ApiTokenService', () => {
  const validSecret =
    'gNrv_NJ4FHZ0UFZJQu_q_3i3-GP_d6tELVtkYiMFLkLWNl_dxEmPVAsCNKxP3N3DB9aGBVFYE1iptvw7hFMJvA';
  const validKeyId = '12345678901';
  const userId = 1;
  const label = 'test token';

  const mockCreatedAt = '2025-11-05 20:45:05';
  const mockCreatedAtIso = '2025-11-05T20:45:05.000Z';

  const mockValidUntil = '2025-12-24 23:59:59';
  const mockValidUntilIso = '2025-12-24T23:59:59.000Z';

  const mockValidUntilExactly2YearsIso = '2027-11-05T20:45:05.000Z';

  const mockValidUntilOver2YearsIso = '2027-12-24T23:59:59.000Z';

  const mockValidUntilOver1YearsIso = '2026-12-24T23:59:59.000Z';

  const mockLastUsedAt = '2025-12-06 07:14:21';
  const mockLastUsedAtIso = '2025-12-06T07:14:21.000Z';

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
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.123456789.${validSecret}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is missing', async () => {
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret has an invalid length', async () => {
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the prefix is wrong', async () => {
        await expect(service.getUserIdForToken(`hd1.${validKeyId}.${validSecret}`)).rejects.toThrow(
          TokenNotValidError,
        );
      });
      it('the token contains sections after the secret', async () => {
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}.extra`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the token does not exist in the database', async () => {
        mockSelect(
          tracker,
          [FieldNameApiToken.secretHash, FieldNameApiToken.userId, FieldNameApiToken.validUntil],
          TableApiToken,
          FieldNameApiToken.id,
          [],
        );
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`),
        ).rejects.toThrow(TokenNotValidError);
        expectBindings(tracker, 'select', [[validKeyId]], true);
      });
      it('ensureTokenIsValid does throw error', async () => {
        mockSelect(
          tracker,
          [FieldNameApiToken.secretHash, FieldNameApiToken.userId, FieldNameApiToken.validUntil],
          TableApiToken,
          FieldNameApiToken.id,
          [
            {
              [FieldNameApiToken.secretHash]: 'foo',
              [FieldNameApiToken.userId]: userId,
              [FieldNameApiToken.validUntil]: '01.01.2020T00:00:00',
            },
          ],
        );
        jest.spyOn(service, 'ensureTokenIsValid').mockImplementation(() => {
          throw new TokenNotValidError();
        });
        await expect(
          service.getUserIdForToken(`${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`),
        ).rejects.toThrow(TokenNotValidError);
        expectBindings(tracker, 'select', [[validKeyId]], true);
      });
    });
    it('works', async () => {
      mockSelect(
        tracker,
        [FieldNameApiToken.secretHash, FieldNameApiToken.userId, FieldNameApiToken.validUntil],
        TableApiToken,
        FieldNameApiToken.id,
        [
          {
            [FieldNameApiToken.secretHash]: 'foo',
            [FieldNameApiToken.userId]: userId,
            [FieldNameApiToken.validUntil]: '01.01.2020T00:00:00',
          },
        ],
      );
      mockUpdate(tracker, TableApiToken, [FieldNameApiToken.lastUsedAt], FieldNameApiToken.id, 1);
      jest.spyOn(service, 'ensureTokenIsValid').mockImplementation(() => {});
      const userByToken = await service.getUserIdForToken(
        `${AUTH_TOKEN_PREFIX}.${validKeyId}.${validSecret}`,
      );
      expect(userByToken).toEqual(userId);
      expectBindings(tracker, 'select', [[validKeyId]], true);
    });
  });

  describe('createToken', () => {
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
          service.createToken(userId, label, isoStringToDateTime(mockValidUntilIso)),
        ).rejects.toThrow(TooManyTokensError);
      });
    });

    describe('works', () => {
      let token: ApiTokenWithSecretDto;
      const mockSecretHash = 'a'.repeat(20);
      let expectedValidUntil: string;

      beforeEach(() => {
        jest.useFakeTimers().setSystemTime(new Date(mockCreatedAtIso));
        jest
          .spyOn(passwordUtils, 'bufferToBase64Url')
          .mockReturnValue(validSecret)
          .mockReturnValue(validKeyId);
        jest.spyOn(passwordUtils, 'hashApiToken').mockReturnValue(mockSecretHash);
        token = {} as ApiTokenWithSecretDto;
        mockSelect(tracker, [FieldNameApiToken.id], TableApiToken, FieldNameApiToken.userId, []);
        mockInsert(tracker, TableApiToken, [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.lastUsedAt,
          FieldNameApiToken.secretHash,
          FieldNameApiToken.userId,
          FieldNameApiToken.validUntil,
        ]);
        expectedValidUntil = mockValidUntilExactly2YearsIso;
      });
      afterEach(() => {
        expect(token.label).toEqual(label);
        expect(token.validUntil).toEqual(expectedValidUntil);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith(AUTH_TOKEN_PREFIX + '.' + token.keyId)).toBe(true);
        expectBindings(tracker, 'select', [[userId]]);
        expectBindings(tracker, 'insert', [
          [
            dateTimeToDB(isoStringToDateTime(mockCreatedAtIso)),
            validKeyId,
            label,
            null,
            mockSecretHash,
            userId,
            dateTimeToDB(isoStringToDateTime(expectedValidUntil)),
          ],
        ]);
        jest.useRealTimers();
      });

      // expect is common in this test group, and therefore called in afterEach instead of each test
      // oxlint-disable-next-line jest/expect-expect
      it('without validUntil', async () => {
        token = await service.createToken(userId, label);
      });

      // oxlint-disable-next-line jest/expect-expect
      it('with validUntil more than two years in the future', async () => {
        token = await service.createToken(
          userId,
          label,
          isoStringToDateTime(mockValidUntilOver2YearsIso),
        );
      });

      // oxlint-disable-next-line jest/expect-expect
      it('with validUntil less than two years in the future', async () => {
        token = await service.createToken(
          userId,
          label,
          isoStringToDateTime(mockValidUntilOver1YearsIso),
        );
        expectedValidUntil = mockValidUntilOver1YearsIso;
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
            getCurrentDateTime().minus({
              day: 1,
            }),
          ),
        ).toThrow(TokenNotValidError);
      });
      it('if checkTokenEquality returns false', () => {
        jest.spyOn(passwordUtils, 'checkTokenEquality').mockReturnValue(false);
        expect(() =>
          service.ensureTokenIsValid(
            validSecret,
            '',
            getCurrentDateTime().minus({
              day: 1,
            }),
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
          getCurrentDateTime().plus({
            day: 1,
          }),
        ),
      ).not.toThrow();
    });
  });
  describe('getTokensOfUserById', () => {
    it('works', async () => {
      mockSelect(
        tracker,
        [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.lastUsedAt,
          FieldNameApiToken.validUntil,
        ],
        TableApiToken,
        FieldNameApiToken.userId,
        [
          {
            [FieldNameApiToken.id]: validKeyId,
            [FieldNameApiToken.label]: label,
            [FieldNameApiToken.validUntil]: mockValidUntil,
            [FieldNameApiToken.createdAt]: mockCreatedAt,
            [FieldNameApiToken.lastUsedAt]: mockLastUsedAt,
          },
        ],
      );
      const tokens = await service.getTokensOfUserById(userId);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([
        {
          label: label,
          validUntil: mockValidUntilIso,
          keyId: validKeyId,
          createdAt: mockCreatedAtIso,
          lastUsedAt: mockLastUsedAtIso,
        },
      ]);
      expectBindings(tracker, 'select', [[userId]]);
    });
    it('should return empty array if token for user does not exist', async () => {
      mockSelect(
        tracker,
        [
          FieldNameApiToken.createdAt,
          FieldNameApiToken.id,
          FieldNameApiToken.label,
          FieldNameApiToken.lastUsedAt,
          FieldNameApiToken.validUntil,
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
      mockDelete(tracker, TableApiToken, [FieldNameApiToken.id, FieldNameApiToken.userId], 0);
      await expect(service.removeToken(validKeyId, userId)).rejects.toThrow(NotInDBError);
    });
    it('works', async () => {
      mockDelete(tracker, TableApiToken, [FieldNameApiToken.id, FieldNameApiToken.userId], 1);
      await service.removeToken(validKeyId, userId);
      expectBindings(tracker, 'delete', [[validKeyId, userId]]);
    });
  });

  describe('removeInvalidTokens', () => {
    it('works', async () => {
      const mockTime = isoStringToDateTime(mockCreatedAtIso);
      jest.useFakeTimers().setSystemTime(new Date(mockCreatedAtIso));
      mockDelete(tracker, TableApiToken, [FieldNameApiToken.validUntil], 1);
      await service.removeInvalidTokens();
      expectBindings(tracker, 'delete', [[dateTimeToDB(mockTime)]]);
      jest.useRealTimers();
    });
  });

  describe('auto remove invalid tokens', () => {
    beforeEach(() => {
      jest.spyOn(service, 'removeInvalidTokens').mockImplementation(async () => {});
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
