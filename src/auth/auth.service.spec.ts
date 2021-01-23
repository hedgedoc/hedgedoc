/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthToken } from './auth-token.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Identity } from '../users/identity.entity';
import { LoggerModule } from '../logger/logger.module';

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  let authToken: AuthToken;

  beforeEach(async () => {
    user = {
      authTokens: [],
      createdAt: new Date(),
      displayName: 'hardcoded',
      id: '1',
      identities: [],
      ownedNotes: [],
      updatedAt: new Date(),
      userName: 'Testy',
    };

    authToken = {
      accessTokenHash: '',
      createdAt: new Date(),
      id: 1,
      identifier: 'testIdentifier',
      keyId: 'abc',
      lastUsed: null,
      user: null,
      validUntil: null,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(AuthToken),
          useValue: {},
        },
      ],
      imports: [PassportModule, UsersModule, LoggerModule],
    })
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({
        findOne: (): AuthToken => {
          return {
            ...authToken,
            user: user,
          };
        },
        save: async (entity: AuthToken) => {
          if (entity.lastUsed === undefined) {
            expect(entity.lastUsed).toBeUndefined();
          } else {
            expect(entity.lastUsed.getTime()).toBeLessThanOrEqual(
              new Date().getTime(),
            );
          }
          return entity;
        },
        remove: async (entity: AuthToken) => {
          expect(entity).toEqual({
            ...authToken,
            user: user,
          });
        },
      })
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: (): User => {
          return {
            ...user,
            authTokens: [authToken],
          };
        },
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPassword', () => {
    it('works', async () => {
      const testPassword = 'thisIsATestPassword';
      const hash = await service.hashPassword(testPassword);
      service
        .checkPassword(testPassword, hash)
        .then((result) => expect(result).toBeTruthy());
    });
  });

  describe('getTokensByUsername', () => {
    it('works', async () => {
      const tokens = await service.getTokensByUsername(user.userName);
      expect(tokens).toHaveLength(1);
      expect(tokens).toEqual([authToken]);
    });
  });

  describe('getAuthToken', () => {
    it('works', async () => {
      const token = 'testToken';
      authToken.accessTokenHash = await service.hashPassword(token);
      const authTokenFromCall = await service.getAuthTokenAndValidate(
        authToken.keyId,
        token,
      );
      expect(authTokenFromCall).toEqual({
        ...authToken,
        user: user,
      });
    });
  });

  describe('setLastUsedToken', () => {
    it('works', async () => {
      await service.setLastUsedToken(authToken.keyId);
    });
  });

  describe('validateToken', () => {
    it('works', async () => {
      const token = 'testToken';
      authToken.accessTokenHash = await service.hashPassword(token);
      const userByToken = await service.validateToken(
        `${authToken.keyId}.${token}`,
      );
      expect(userByToken).toEqual({
        ...user,
        authTokens: [authToken],
      });
    });
  });

  describe('removeToken', () => {
    it('works', async () => {
      await service.removeToken(user.userName, authToken.keyId);
    });
  });

  describe('createTokenForUser', () => {
    it('works', async () => {
      const identifier = 'identifier2';
      const token = await service.createTokenForUser(
        user.userName,
        identifier,
        0,
      );
      expect(token.label).toEqual(identifier);
      expect(token.validUntil).toBeNull();
      expect(token.lastUsed).toBeNull();
      expect(token.secret.startsWith(token.keyId)).toBeTruthy();
    });
  });

  describe('BufferToBase64Url', () => {
    it('works', () => {
      expect(
        service.BufferToBase64Url(
          Buffer.from('testsentence is a test sentence'),
        ),
      ).toEqual('dGVzdHNlbnRlbmNlIGlzIGEgdGVzdCBzZW50ZW5jZQ');
    });
  });

  describe('toAuthTokenDto', () => {
    it('works', async () => {
      const tokenDto = await service.toAuthTokenDto(authToken);
      expect(tokenDto.keyId).toEqual(authToken.keyId);
      expect(tokenDto.lastUsed).toBeNull();
      expect(tokenDto.label).toEqual(authToken.identifier);
      expect(tokenDto.validUntil).toBeNull();
      expect(tokenDto.createdAt.getTime()).toEqual(
        authToken.createdAt.getTime(),
      );
    });
  });
});
