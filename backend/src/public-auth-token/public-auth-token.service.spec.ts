/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import crypto from 'crypto';
import { Repository } from 'typeorm';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import {
  NotInDBError,
  TokenNotValidError,
  TooManyTokensError,
} from '../errors/errors';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { PublicAuthToken } from './public-auth-token.entity';
import { PublicAuthTokenService } from './public-auth-token.service';

describe('AuthService', () => {
  let service: PublicAuthTokenService;
  let user: User;
  let authToken: PublicAuthToken;
  let userRepo: Repository<User>;
  let authTokenRepo: Repository<PublicAuthToken>;

  class CreateQueryBuilderClass {
    leftJoinAndSelect: () => CreateQueryBuilderClass;
    where: () => CreateQueryBuilderClass;
    orWhere: () => CreateQueryBuilderClass;
    setParameter: () => CreateQueryBuilderClass;
    getOne: () => PublicAuthToken;
    getMany: () => PublicAuthToken[];
  }

  let createQueryBuilderFunc: CreateQueryBuilderClass;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicAuthTokenService,
        {
          provide: getRepositoryToken(PublicAuthToken),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, authConfigMock],
        }),
        PassportModule,
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

    service = module.get<PublicAuthTokenService>(PublicAuthTokenService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    authTokenRepo = module.get<Repository<PublicAuthToken>>(
      getRepositoryToken(PublicAuthToken),
    );

    user = User.create('hardcoded', 'Testy') as User;
    authToken = PublicAuthToken.create(
      'testKeyId',
      user,
      'testToken',
      'abc',
      new Date(new Date().getTime() + 60000), // make this AuthToken valid for 1min
    ) as PublicAuthToken;

    const createQueryBuilder = {
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      orWhere: () => createQueryBuilder,
      setParameter: () => createQueryBuilder,
      getOne: () => authToken,
      getMany: () => [authToken],
    };
    createQueryBuilderFunc = createQueryBuilder;
    jest
      .spyOn(authTokenRepo, 'createQueryBuilder')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(() => createQueryBuilder);

    jest.spyOn(authTokenRepo, 'find').mockResolvedValue([authToken]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokensByUser', () => {
    it('works', async () => {
      createQueryBuilderFunc.getMany = () => [authToken];
      const tokens = await service.getTokensByUser(user);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([authToken]);
    });
    it('should return empty array if token for user do not exists', async () => {
      jest
        .spyOn(authTokenRepo, 'find')
        .mockImplementationOnce(async () => null);
      const tokens = await service.getTokensByUser(user);
      expect(tokens).toHaveLength(0);
      expect(tokens).toEqual([]);
    });
  });

  describe('getAuthToken', () => {
    const token = 'testToken';
    it('works', async () => {
      const accessTokenHash = crypto
        .createHash('sha512')
        .update(token)
        .digest('hex');
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
        ...authToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
      const authTokenFromCall = await service.getAuthToken(authToken.keyId);
      expect(authTokenFromCall).toEqual({
        ...authToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
    });
    describe('fails:', () => {
      it('AuthToken could not be found', async () => {
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(null);
        await expect(service.getAuthToken(authToken.keyId)).rejects.toThrow(
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
        undefined,
      );

      expect(() =>
        service.checkToken(secret, accessToken as PublicAuthToken),
      ).not.toThrow();
    });
    it('AuthToken has wrong hash', () => {
      const [accessToken] = service.createToken(user, 'TestToken', undefined);
      expect(() =>
        service.checkToken('secret', accessToken as PublicAuthToken),
      ).toThrow(TokenNotValidError);
    });
    it('AuthToken has wrong validUntil Date', () => {
      const [accessToken, secret] = service.createToken(
        user,
        'Test',
        1549312452000,
      );
      expect(() =>
        service.checkToken(secret, accessToken as PublicAuthToken),
      ).toThrow(TokenNotValidError);
    });
  });

  describe('setLastUsedToken', () => {
    it('works', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
        ...authToken,
        user: Promise.resolve(user),
        lastUsedAt: new Date(1549312452000),
      });
      jest
        .spyOn(authTokenRepo, 'save')
        .mockImplementationOnce(
          async (authTokenSaved, _): Promise<PublicAuthToken> => {
            expect(authTokenSaved.keyId).toEqual(authToken.keyId);
            expect(authTokenSaved.lastUsedAt).not.toEqual(1549312452000);
            return authToken;
          },
        );
      await service.setLastUsedToken(authToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.setLastUsedToken(authToken.keyId)).rejects.toThrow(
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
        publicAuthTokens: Promise.resolve([authToken]),
      });
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValue({
        ...authToken,
        user: Promise.resolve(user),
        hash: accessTokenHash,
      });
      jest
        .spyOn(authTokenRepo, 'save')
        .mockImplementationOnce(async (_, __): Promise<PublicAuthToken> => {
          return authToken;
        });
      const userByToken = await service.validateToken(
        `hd2.${authToken.keyId}.${testSecret}`,
      );
      expect(userByToken).toEqual({
        ...user,
        publicAuthTokens: Promise.resolve([authToken]),
      });
    });
    describe('fails:', () => {
      it('the prefix is missing', async () => {
        await expect(
          service.validateToken(`${authToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the prefix is wrong', async () => {
        await expect(
          service.validateToken(`hd1.${authToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is missing', async () => {
        await expect(
          service.validateToken(`hd2.${authToken.keyId}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is too long', async () => {
        await expect(
          service.validateToken(`hd2.${authToken.keyId}.${'a'.repeat(73)}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the token contains sections after the secret', async () => {
        await expect(
          service.validateToken(
            `hd2.${authToken.keyId}.${'a'.repeat(73)}.extra`,
          ),
        ).rejects.toThrow(TokenNotValidError);
      });
    });
  });

  describe('removeToken', () => {
    it('works', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValue({
        ...authToken,
        user: Promise.resolve(user),
      });
      jest
        .spyOn(authTokenRepo, 'remove')
        .mockImplementationOnce(async (token, __): Promise<PublicAuthToken> => {
          expect(token).toEqual({
            ...authToken,
            user: Promise.resolve(user),
          });
          return authToken;
        });
      await service.removeToken(authToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.removeToken(authToken.keyId)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('addToken', () => {
    describe('works', () => {
      const identifier = 'testIdentifier';
      it('with validUntil 0', async () => {
        jest.spyOn(authTokenRepo, 'find').mockResolvedValueOnce([authToken]);
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (
              authTokenSaved: PublicAuthToken,
              _,
            ): Promise<PublicAuthToken> => {
              expect(authTokenSaved.lastUsedAt).toBeNull();
              return authTokenSaved;
            },
          );
        const token = await service.addToken(user, identifier, 0);
        expect(token.label).toEqual(identifier);
        expect(
          token.validUntil.getTime() -
            (new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
        ).toBeLessThanOrEqual(10000);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith('hd2.' + token.keyId)).toBeTruthy();
      });
      it('with validUntil not 0', async () => {
        jest.spyOn(authTokenRepo, 'find').mockResolvedValueOnce([authToken]);
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (
              authTokenSaved: PublicAuthToken,
              _,
            ): Promise<PublicAuthToken> => {
              expect(authTokenSaved.lastUsedAt).toBeNull();
              return authTokenSaved;
            },
          );
        const validUntil = new Date().getTime() + 30000;
        const token = await service.addToken(user, identifier, validUntil);
        expect(token.label).toEqual(identifier);
        expect(token.validUntil.getTime()).toEqual(validUntil);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith('hd2.' + token.keyId)).toBeTruthy();
      });
      it('should throw TooManyTokensError when number of tokens >= 200', async () => {
        jest
          .spyOn(authTokenRepo, 'find')
          .mockImplementationOnce(async (): Promise<PublicAuthToken[]> => {
            const inValidToken = [authToken];
            inValidToken.length = 201;
            return inValidToken;
          });
        const validUntil = new Date().getTime() + 30000;
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
      const expiredToken = { ...authToken, validUntil: new Date(expiredDate) };
      jest
        .spyOn(authTokenRepo, 'find')
        .mockResolvedValueOnce([expiredToken, authToken]);
      jest
        .spyOn(authTokenRepo, 'remove')
        .mockImplementationOnce(async (token): Promise<PublicAuthToken> => {
          expect(token).toEqual(expiredToken);
          expect(token).not.toBe(authToken);
          return authToken;
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
    const authToken = new PublicAuthToken();
    authToken.keyId = 'testKeyId';
    authToken.label = 'testLabel';
    const date = new Date();
    date.setHours(date.getHours() - 1);
    authToken.createdAt = date;
    authToken.validUntil = new Date();
    it('works', () => {
      const tokenDto = service.toAuthTokenDto(authToken);
      expect(tokenDto.keyId).toEqual(authToken.keyId);
      expect(tokenDto.lastUsedAt).toBeNull();
      expect(tokenDto.label).toEqual(authToken.label);
      expect(tokenDto.validUntil.getTime()).toEqual(
        authToken.validUntil.getTime(),
      );
      expect(tokenDto.createdAt.getTime()).toEqual(
        authToken.createdAt.getTime(),
      );
    });
    it('should have lastUsedAt', () => {
      authToken.lastUsedAt = new Date();
      const tokenDto = service.toAuthTokenDto(authToken);
      expect(tokenDto.lastUsedAt).toEqual(authToken.lastUsedAt);
    });
  });
});
