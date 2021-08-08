/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import { NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { User } from '../users/user.entity';
import { checkPassword, hashPassword } from '../utils/password';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { ProviderType } from './provider-type.enum';

describe('IdentityService', () => {
  let service: IdentityService;
  let user: User;
  let identityRepo: Repository<Identity>;
  const password = 'test123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        {
          provide: getRepositoryToken(Identity),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, authConfigMock],
        }),
        LoggerModule,
      ],
    }).compile();

    service = module.get<IdentityService>(IdentityService);
    user = User.create('test', 'Testy') as User;
    identityRepo = module.get<Repository<Identity>>(
      getRepositoryToken(Identity),
    );
  });

  describe('createLocalIdentity', () => {
    it('works', async () => {
      jest
        .spyOn(identityRepo, 'save')
        .mockImplementationOnce(
          async (identity: Identity): Promise<Identity> => identity,
        );
      const identity = await service.createLocalIdentity(user, password);
      await checkPassword(password, identity.passwordHash ?? '').then(
        (result) => expect(result).toBeTruthy(),
      );
      expect(identity.user).toEqual(user);
    });
  });

  describe('updateLocalPassword', () => {
    beforeEach(async () => {
      jest
        .spyOn(identityRepo, 'save')
        .mockImplementationOnce(
          async (identity: Identity): Promise<Identity> => identity,
        )
        .mockImplementationOnce(
          async (identity: Identity): Promise<Identity> => identity,
        );
      const identity = await service.createLocalIdentity(user, password);
      user.identities = Promise.resolve([identity]);
    });
    it('works', async () => {
      const newPassword = 'newPassword';
      const identity = await service.updateLocalPassword(user, newPassword);
      await checkPassword(newPassword, identity.passwordHash ?? '').then(
        (result) => expect(result).toBeTruthy(),
      );
      expect(identity.user).toEqual(user);
    });
    it('fails, when user has no local identity', async () => {
      user.identities = Promise.resolve([]);
      await expect(service.updateLocalPassword(user, password)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('loginWithLocalIdentity', () => {
    it('works', async () => {
      const identity = Identity.create(user, ProviderType.LOCAL);
      identity.passwordHash = await hashPassword(password);
      user.identities = Promise.resolve([identity]);
      await expect(
        service.loginWithLocalIdentity(user, password),
      ).resolves.toEqual(undefined);
    });
    describe('fails', () => {
      it('when user has no local identity', async () => {
        user.identities = Promise.resolve([]);
        await expect(
          service.updateLocalPassword(user, password),
        ).rejects.toThrow(NotInDBError);
      });
      it('when the password is wrong', async () => {
        user.identities = Promise.resolve([]);
        await expect(
          service.updateLocalPassword(user, 'wrong_password'),
        ).rejects.toThrow(NotInDBError);
      });
    });
  });
});
