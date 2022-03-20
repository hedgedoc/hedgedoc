/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { hashPassword } from '../utils/password';
import { AuthToken } from './auth-token.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  let authToken: AuthToken;
  let userRepo: Repository<User>;
  let authTokenRepo: Repository<AuthToken>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AuthToken),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
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

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    authTokenRepo = module.get<Repository<AuthToken>>(
      getRepositoryToken(AuthToken),
    );

    user = User.create('hardcoded', 'Testy') as User;
    authToken = AuthToken.create(
      'testKeyId',
      user,
      'testToken',
      'abc',
      new Date(new Date().getTime() + 60000), // make this AuthToken valid for 1min
    ) as AuthToken;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokensByUser', () => {
    it('works', async () => {
      jest.spyOn(authTokenRepo, 'find').mockResolvedValueOnce([authToken]);
      const tokens = await service.getTokensByUser(user);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([authToken]);
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
        accessTokenHash: accessTokenHash,
      });
      const authTokenFromCall = await service.getAuthTokenAndValidate(
        authToken.keyId,
        token,
      );
      expect(authTokenFromCall).toEqual({
        ...authToken,
        user: Promise.resolve(user),
        accessTokenHash: accessTokenHash,
      });
    });
    describe('fails:', () => {
      it('AuthToken could not be found', async () => {
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(null);
        await expect(
          service.getAuthTokenAndValidate(authToken.keyId, token),
        ).rejects.toThrow(NotInDBError);
      });
      it('AuthToken has wrong hash', async () => {
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
          ...authToken,
          user: Promise.resolve(user),
          accessTokenHash: 'the wrong hash',
        });
        await expect(
          service.getAuthTokenAndValidate(authToken.keyId, token),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('AuthToken has wrong validUntil Date', async () => {
        const accessTokenHash = await hashPassword(token);
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
          ...authToken,
          user: Promise.resolve(user),
          accessTokenHash: accessTokenHash,
          validUntil: new Date(1549312452000),
        });
        await expect(
          service.getAuthTokenAndValidate(authToken.keyId, token),
        ).rejects.toThrow(TokenNotValidError);
      });
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
          async (authTokenSaved, _): Promise<AuthToken> => {
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
        authTokens: Promise.resolve([authToken]),
      });
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValue({
        ...authToken,
        user: Promise.resolve(user),
        accessTokenHash: accessTokenHash,
      });
      jest
        .spyOn(authTokenRepo, 'save')
        .mockImplementationOnce(async (_, __): Promise<AuthToken> => {
          return authToken;
        });
      const userByToken = await service.validateToken(
        `${authToken.keyId}.${testSecret}`,
      );
      expect(userByToken).toEqual({
        ...user,
        authTokens: Promise.resolve([authToken]),
      });
    });
    describe('fails:', () => {
      it('the secret is missing', async () => {
        await expect(
          service.validateToken(`${authToken.keyId}`),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('the secret is too long', async () => {
        await expect(
          service.validateToken(`${authToken.keyId}.${'a'.repeat(73)}`),
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
        .mockImplementationOnce(async (token, __): Promise<AuthToken> => {
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

  describe('createTokenForUser', () => {
    describe('works', () => {
      const identifier = 'testIdentifier';
      it('with validUntil 0', async () => {
        jest.spyOn(authTokenRepo, 'find').mockResolvedValueOnce([authToken]);
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (authTokenSaved: AuthToken, _): Promise<AuthToken> => {
              expect(authTokenSaved.lastUsedAt).toBeNull();
              return authTokenSaved;
            },
          );
        const token = await service.createTokenForUser(user, identifier, 0);
        expect(token.label).toEqual(identifier);
        expect(
          token.validUntil.getTime() -
            (new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
        ).toBeLessThanOrEqual(10000);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith(token.keyId)).toBeTruthy();
      });
      it('with validUntil not 0', async () => {
        jest.spyOn(authTokenRepo, 'find').mockResolvedValueOnce([authToken]);
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (authTokenSaved: AuthToken, _): Promise<AuthToken> => {
              expect(authTokenSaved.lastUsedAt).toBeNull();
              return authTokenSaved;
            },
          );
        const validUntil = new Date().getTime() + 30000;
        const token = await service.createTokenForUser(
          user,
          identifier,
          validUntil,
        );
        expect(token.label).toEqual(identifier);
        expect(token.validUntil.getTime()).toEqual(validUntil);
        expect(token.lastUsedAt).toBeNull();
        expect(token.secret.startsWith(token.keyId)).toBeTruthy();
      });
    });
  });

  describe('toAuthTokenDto', () => {
    it('works', () => {
      const authToken = new AuthToken();
      authToken.keyId = 'testKeyId';
      authToken.label = 'testLabel';
      const date = new Date();
      date.setHours(date.getHours() - 1);
      authToken.createdAt = date;
      authToken.validUntil = new Date();
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
  });
});
