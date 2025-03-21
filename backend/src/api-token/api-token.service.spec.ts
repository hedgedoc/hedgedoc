/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Repository } from 'typeorm';

import { Identity } from '../auth/identity.entity';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { ApiToken } from './api-token.entity';
import { ApiTokenService } from './api-token.service';

describe('ApiTokenService', () => {
  let service: ApiTokenService;
  let user: User;
  let apiToken: ApiToken;
  let userRepo: Repository<User>;
  let apiTokenRepo: Repository<ApiToken>;

  class CreateQueryBuilderClass {
    leftJoinAndSelect: () => CreateQueryBuilderClass;
    where: () => CreateQueryBuilderClass;
    orWhere: () => CreateQueryBuilderClass;
    setParameter: () => CreateQueryBuilderClass;
    getOne: () => ApiToken;
    getMany: () => ApiToken[];
  }

  let createQueryBuilderFunc: CreateQueryBuilderClass;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenService,
        {
          provide: getRepositoryToken(ApiToken),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, authConfigMock],
        }),
        UsersModule,
        LoggerModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .compile();

    service = module.get<ApiTokenService>(ApiTokenService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    apiTokenRepo = module.get<Repository<ApiToken>>(
      getRepositoryToken(ApiToken),
    );

    user = User.create('hardcoded', 'Testy') as User;
    apiToken = ApiToken.create(
      'testKeyId',
      user,
      'testToken',
      'abc',
      new Date(new Date().getTime() + 60000), // make this AuthToken valid for 1min
    ) as ApiToken;

    const createQueryBuilder = {
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      orWhere: () => createQueryBuilder,
      setParameter: () => createQueryBuilder,
      getOne: () => apiToken,
      getMany: () => [apiToken],
    };
    createQueryBuilderFunc = createQueryBuilder;
    jest
      .spyOn(apiTokenRepo, 'createQueryBuilder')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(() => createQueryBuilder);

    jest.spyOn(apiTokenRepo, 'find').mockResolvedValue([apiToken]);
  });

  describe('getTokensByUser', () => {
    it('works', async () => {
      createQueryBuilderFunc.getMany = () => [apiToken];
      const tokens = await service.getTokensByUser(user);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([apiToken]);
    });
    it('should return empty array if token for user do not exists', async () => {
      jest.spyOn(apiTokenRepo, 'find').mockImplementationOnce(async () => []);
      const tokens = await service.getTokensByUser(user);
      expect(tokens).toHaveLength(0);
      expect(tokens).toEqual([]);
    });
  });

  describe('getToken', () => {
    const token = 'testToken';
    it('works', async () => {
      const accessTokenHash = crypto
        .createHash('sha512')
        .update(token)
        .digest('hex');
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValueOnce({
        ...apiToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
      const authTokenFromCall = await service.getToken(apiToken.keyId);
      expect(authTokenFromCall).toEqual({
        ...apiToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
    });
    describe('fails:', () => {
      it('AuthToken could not be found', async () => {
        jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValueOnce(null);
        await expect(service.getToken(apiToken.keyId)).rejects.toThrow(
          NotInDBError,
        );
      });
    });
  });
  describe('checkToken', () => {
    it('works', () => {
      const [accessToken, secret] = service.createToken(
        user,
        'TestToken',
        null,
      );

      expect(() =>
        service.checkToken(secret, accessToken as ApiToken),
      ).not.toThrow();
    });
    it('AuthToken has wrong hash', () => {
      const [accessToken] = service.createToken(user, 'TestToken', null);
      expect(() =>
        service.checkToken('secret', accessToken as ApiToken),
      ).toThrow(TokenNotValidError);
    });
    it('AuthToken has wrong validUntil Date', () => {
      const [accessToken, secret] = service.createToken(
        user,
        'Test',
        new Date(1549312452000),
      );
      expect(() => service.checkToken(secret, accessToken as ApiToken)).toThrow(
        TokenNotValidError,
      );
    });
  });

  describe('setLastUsedToken', () => {
    it('works', async () => {
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValueOnce({
        ...apiToken,
        user: Promise.resolve(user),
        lastUsedAt: new Date(1549312452000),
      });
      jest
        .spyOn(apiTokenRepo, 'save')
        .mockImplementationOnce(
          async (authTokenSaved, _): Promise<ApiToken> => {
            expect(authTokenSaved.keyId).toEqual(apiToken.keyId);
            expect(authTokenSaved.lastUsedAt).not.toEqual(1549312452000);
            return apiToken;
          },
        );
      await service.setLastUsedToken(apiToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.setLastUsedToken(apiToken.keyId)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('validateToken', () => {
    it('works', async () => {
      const testSecret =
        'gNrv_NJ4FHZ0UFZJQu_q_3i3-GP_d6tELVtkYiMFLkLWNl_dxEmPVAsCNKxP3N3DB9aGBVFYE1iptvw7hFMJvA';
      const accessTokenHash = crypto
        .createHash('sha512')
        .update(testSecret)
        .digest('hex');
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce({
        ...user,
        apiTokens: Promise.resolve([apiToken]),
      });
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValue({
        ...apiToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
      jest
        .spyOn(apiTokenRepo, 'save')
        .mockImplementationOnce(async (_, __): Promise<ApiToken> => {
          return apiToken;
        });
      const userByToken = await service.validateToken(
        `hd2.${apiToken.keyId}.${testSecret}`,
      );
      expect(userByToken).toEqual({
        ...user,
        apiTokens: Promise.resolve([apiToken]),
      });
    });
    describe('fails:', () => {
      it('the prefix is missing', async () => {
        await expect(
          service.validateToken(`${apiToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the prefix is wrong', async () => {
        await expect(
          service.validateToken(`hd1.${apiToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is missing', async () => {
        await expect(
          service.validateToken(`hd2.${apiToken.keyId}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is too long', async () => {
        await expect(
          service.validateToken(`hd2.${apiToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the token contains sections after the secret', async () => {
        await expect(
          service.validateToken(
            `hd2.${apiToken.keyId}.${'a'.repeat(73)}.extra`,
          ),
        ).rejects.toThrow(TokenNotValidError);
      });
    });
  });

  describe('removeToken', () => {
    it('works', async () => {
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValue({
        ...apiToken,
        user: Promise.resolve(user),
      });
      jest
        .spyOn(apiTokenRepo, 'remove')
        .mockImplementationOnce(async (token, __): Promise<ApiToken> => {
          expect(token).toEqual({
            ...apiToken,
            user: Promise.resolve(user),
          });
          return apiToken;
        });
      await service.removeToken(apiToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(apiTokenRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.removeToken(apiToken.keyId)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('addToken', () => {
    describe('works', () => {
      const identifier = 'testIdentifier';
      it('with validUntil 0', async () => {
        jest.spyOn(apiTokenRepo, 'find').mockResolvedValueOnce([apiToken]);
        jest
          .spyOn(apiTokenRepo, 'save')
          .mockImplementationOnce(
            async (apiTokenSaved: ApiToken, _): Promise<ApiToken> => {
              expect(apiTokenSaved.lastUsedAt).toBeNull();
              apiTokenSaved.createdAt = new Date(1);
              return apiTokenSaved;
            },
          );
        const token = await service.addToken(user, identifier, new Date(0));
        expect(token.label).toEqual(identifier);
        expect(
          new Date(token.validUntil).getTime() -
            (new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
        ).toBeLessThanOrEqual(10000);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith('hd2.' + token.keyId)).toBeTruthy();
      });
      it('with validUntil not 0', async () => {
        jest.spyOn(apiTokenRepo, 'find').mockResolvedValueOnce([apiToken]);
        jest
          .spyOn(apiTokenRepo, 'save')
          .mockImplementationOnce(
            async (apiTokenSaved: ApiToken, _): Promise<ApiToken> => {
              expect(apiTokenSaved.lastUsedAt).toBeNull();
              apiTokenSaved.createdAt = new Date(1);
              return apiTokenSaved;
            },
          );
        const validUntil = new Date();
        validUntil.setTime(validUntil.getTime() + 30000);
        const token = await service.addToken(user, identifier, validUntil);
        expect(token.label).toEqual(identifier);
        expect(new Date(token.validUntil)).toEqual(validUntil);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith('hd2.' + token.keyId)).toBeTruthy();
      });
      it('should throw TooManyTokensError when number of tokens >= 200', async () => {
        jest
          .spyOn(apiTokenRepo, 'find')
          .mockImplementationOnce(async (): Promise<ApiToken[]> => {
            const inValidToken = [apiToken];
            inValidToken.length = 201;
            return inValidToken;
          });
        const validUntil = new Date();
        validUntil.setTime(validUntil.getTime() + 30000);
        await expect(
          service.addToken(user, identifier, validUntil),
        ).rejects.toThrow(TooManyTokensError);
      });
    });
  });

  describe('removeInvalidTokens', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('works', async () => {
      const expiredDate = new Date().getTime() - 30000;
      const expiredToken = { ...apiToken, validUntil: new Date(expiredDate) };
      jest
        .spyOn(apiTokenRepo, 'find')
        .mockResolvedValueOnce([expiredToken, apiToken]);
      jest
        .spyOn(apiTokenRepo, 'remove')
        .mockImplementationOnce(async (token): Promise<ApiToken> => {
          expect(token).toEqual(expiredToken);
          expect(token).not.toBe(apiToken);
          return apiToken;
        });

      await service.removeInvalidTokens();
    });
  });

  describe('auto remove invalid tokens', () => {
    beforeEach(() => {
      jest.spyOn(service, 'removeInvalidTokens');
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

  describe('toAuthTokenDto', () => {
    const apiToken = new ApiToken();
    apiToken.keyId = 'testKeyId';
    apiToken.label = 'testLabel';
    const date = new Date();
    date.setHours(date.getHours() - 1);
    apiToken.createdAt = date;
    apiToken.validUntil = new Date();
    it('works', () => {
      const tokenDto = service.toAuthTokenDto(apiToken);
      expect(tokenDto.keyId).toEqual(apiToken.keyId);
      expect(tokenDto.lastUsedAt).toBeNull();
      expect(tokenDto.label).toEqual(apiToken.label);
      expect(new Date(tokenDto.validUntil).getTime()).toEqual(
        apiToken.validUntil.getTime(),
      );
      expect(new Date(tokenDto.createdAt).getTime()).toEqual(
        apiToken.createdAt.getTime(),
      );
    });
    it('should have lastUsedAt', () => {
      apiToken.lastUsedAt = new Date();
      const tokenDto = service.toAuthTokenDto(apiToken);
      expect(tokenDto.lastUsedAt).toEqual(apiToken.lastUsedAt.toISOString());
    });
  });
});
