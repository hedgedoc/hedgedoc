/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Session } from '../users/session.entity';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Identity } from '../users/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { AuthToken } from './auth-token.entity';
import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import appConfigMock from '../config/mock/app.config.mock';
import { randomBytes } from 'crypto';

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
      user,
      'testToken',
      'testKeyId',
      'abc',
      new Date(new Date().getTime() + 60000), // make this AuthToken valid for 1min
    ) as AuthToken;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPassword', () => {
    it('works', async () => {
      const testPassword = 'thisIsATestPassword';
      const hash = await service.hashPassword(testPassword);
      await service
        .checkPassword(testPassword, hash)
        .then((result) => expect(result).toBeTruthy());
    });
    it('fails, if secret is too short', async () => {
      const secret = service.bufferToBase64Url(randomBytes(54));
      const hash = await service.hashPassword(secret);
      await service
        .checkPassword(secret, hash)
        .then((result) => expect(result).toBeTruthy());
      await service
        .checkPassword(secret.substr(0, secret.length - 1), hash)
        .then((result) => expect(result).toBeFalsy());
    });
  });

  describe('getTokensByUsername', () => {
    it('works', async () => {
      jest
        .spyOn(userRepo, 'findOne')
        .mockResolvedValueOnce({ ...user, authTokens: [authToken] });
      const tokens = await service.getTokensByUsername(user.userName);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([authToken]);
    });
  });

  describe('getAuthToken', () => {
    const token = 'testToken';
    it('works', async () => {
      const accessTokenHash = await service.hashPassword(token);
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
        ...authToken,
        user: user,
        accessTokenHash: accessTokenHash,
      });
      const authTokenFromCall = await service.getAuthTokenAndValidate(
        authToken.keyId,
        token,
      );
      expect(authTokenFromCall).toEqual({
        ...authToken,
        user: user,
        accessTokenHash: accessTokenHash,
      });
    });
    describe('fails:', () => {
      it('AuthToken could not be found', async () => {
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(undefined);
        await expect(
          service.getAuthTokenAndValidate(authToken.keyId, token),
        ).rejects.toThrow(NotInDBError);
      });
      it('AuthToken has wrong hash', async () => {
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
          ...authToken,
          user: user,
          accessTokenHash: 'the wrong hash',
        });
        await expect(
          service.getAuthTokenAndValidate(authToken.keyId, token),
        ).rejects.toThrow(TokenNotValidError);
      });
      it('AuthToken has wrong validUntil Date', async () => {
        const accessTokenHash = await service.hashPassword(token);
        jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce({
          ...authToken,
          user: user,
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
        user: user,
        lastUsed: new Date(1549312452000),
      });
      jest
        .spyOn(authTokenRepo, 'save')
        .mockImplementationOnce(
          async (authTokenSaved, _): Promise<AuthToken> => {
            expect(authTokenSaved.keyId).toEqual(authToken.keyId);
            expect(authTokenSaved.lastUsed).not.toEqual(1549312452000);
            return authToken;
          },
        );
      await service.setLastUsedToken(authToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(undefined);
      await expect(service.setLastUsedToken(authToken.keyId)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('validateToken', () => {
    it('works', async () => {
      const token = 'testToken';
      const accessTokenHash = await service.hashPassword(token);
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce({
        ...user,
        authTokens: [authToken],
      });
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValue({
        ...authToken,
        user: user,
        accessTokenHash: accessTokenHash,
      });
      jest
        .spyOn(authTokenRepo, 'save')
        .mockImplementationOnce(async (_, __): Promise<AuthToken> => {
          return authToken;
        });
      const userByToken = await service.validateToken(
        `${authToken.keyId}.${token}`,
      );
      expect(userByToken).toEqual({
        ...user,
        authTokens: [authToken],
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
        user: user,
      });
      jest
        .spyOn(authTokenRepo, 'remove')
        .mockImplementationOnce(async (token, __): Promise<AuthToken> => {
          expect(token).toEqual({
            ...authToken,
            user: user,
          });
          return authToken;
        });
      await service.removeToken(authToken.keyId);
    });
    it('throws if the token is not in the database', async () => {
      jest.spyOn(authTokenRepo, 'findOne').mockResolvedValueOnce(undefined);
      await expect(service.removeToken(authToken.keyId)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('createTokenForUser', () => {
    describe('works', () => {
      const identifier = 'testIdentifier';
      it('with validUntil 0', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce({
          ...user,
          authTokens: [authToken],
        });
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (authTokenSaved: AuthToken, _): Promise<AuthToken> => {
              expect(authTokenSaved.lastUsed).toBeNull();
              return authTokenSaved;
            },
          );
        const token = await service.createTokenForUser(
          user.userName,
          identifier,
          0,
        );
        expect(token.label).toEqual(identifier);
        expect(
          token.validUntil.getTime() -
            (new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
        ).toBeLessThanOrEqual(10000);
        expect(token.lastUsed).toBeNull();
        expect(token.secret.startsWith(token.keyId)).toBeTruthy();
      });
      it('with validUntil not 0', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce({
          ...user,
          authTokens: [authToken],
        });
        jest
          .spyOn(authTokenRepo, 'save')
          .mockImplementationOnce(
            async (authTokenSaved: AuthToken, _): Promise<AuthToken> => {
              expect(authTokenSaved.lastUsed).toBeNull();
              return authTokenSaved;
            },
          );
        const validUntil = new Date().getTime() + 30000;
        const token = await service.createTokenForUser(
          user.userName,
          identifier,
          validUntil,
        );
        expect(token.label).toEqual(identifier);
        expect(token.validUntil.getTime()).toEqual(validUntil);
        expect(token.lastUsed).toBeNull();
        expect(token.secret.startsWith(token.keyId)).toBeTruthy();
      });
    });
  });

  describe('bufferToBase64Url', () => {
    it('works', () => {
      expect(
        service.bufferToBase64Url(
          Buffer.from('testsentence is a test sentence'),
        ),
      ).toEqual('dGVzdHNlbnRlbmNlIGlzIGEgdGVzdCBzZW50ZW5jZQ');
    });
  });

  describe('toAuthTokenDto', () => {
    it('works', () => {
      const authToken = new AuthToken();
      authToken.keyId = 'testKeyId';
      authToken.label = 'testLabel';
      authToken.createdAt = new Date();
      authToken.validUntil = new Date();
      const tokenDto = service.toAuthTokenDto(authToken);
      expect(tokenDto.keyId).toEqual(authToken.keyId);
      expect(tokenDto.lastUsed).toBeNull();
      expect(tokenDto.label).toEqual(authToken.label);
      expect(tokenDto.validUntil.getTime()).toEqual(
        authToken.createdAt.getTime(),
      );
      expect(tokenDto.createdAt.getTime()).toEqual(
        authToken.createdAt.getTime(),
      );
    });
  });
});
