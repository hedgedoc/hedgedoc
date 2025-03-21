/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
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

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const username = 'hardcoded';
    const displayname = 'Testy';
    beforeEach(() => {
      jest
        .spyOn(userRepo, 'save')
        .mockImplementationOnce(async (user: User): Promise<User> => user);
    });
    it('successfully creates a user', async () => {
      const user = await service.createUser(username, displayname, null, null);
      expect(user.username).toEqual(username);
      expect(user.displayName).toEqual(displayname);
    });
    it('fails if username is already taken', async () => {
      // add additional mock implementation for failure
      jest.spyOn(userRepo, 'save').mockImplementationOnce(() => {
        throw new Error();
      });
      // create first user with username
      await service.createUser(username, displayname, null, null);
      // attempt to create second user with username
      await expect(
        service.createUser(username, displayname, null, null),
      ).rejects.toThrow(AlreadyInDBError);
    });
  });

  describe('deleteUser', () => {
    it('works', async () => {
      const username = 'hardcoded';
      const displayname = 'Testy';
      const newUser = User.create(username, displayname) as User;
      jest.spyOn(userRepo, 'remove').mockImplementationOnce(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (user: User): Promise<User> => {
          expect(user).toEqual(newUser);
          return user;
        },
      );
      await service.deleteUser(newUser);
    });
  });

  describe('changedDisplayName', () => {
    it('works', async () => {
      const username = 'hardcoded';
      const displayname = 'Testy';
      const user = User.create(username, displayname) as User;
      const newDisplayName = 'Testy2';
      jest.spyOn(userRepo, 'save').mockImplementationOnce(
        // eslint-disable-next-line @typescript-eslint/require-await
        async (user: User): Promise<User> => {
          expect(user.displayName).toEqual(newDisplayName);
          return user;
        },
      );
      await service.updateUser(user, newDisplayName, undefined, undefined);
    });
  });

  describe('getUserByUsername', () => {
    const username = 'hardcoded';
    const displayname = 'Testy';
    const user = User.create(username, displayname) as User;
    it('works', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
      const getUser = await service.getUserByUsername(username);
      expect(getUser.username).toEqual(username);
      expect(getUser.displayName).toEqual(displayname);
    });
    it('fails when user does not exits', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.getUserByUsername(username)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('getPhotoUrl', () => {
    const username = 'hardcoded';
    const displayname = 'Testy';
    const user = User.create(username, displayname) as User;
    it('works if a user has a photoUrl', () => {
      const photo = 'testPhotoUrl';
      user.photo = photo;
      const photoUrl = service.getPhotoUrl(user);
      expect(photoUrl).toEqual(photo);
    });
    it('works if a user no photoUrl', () => {
      user.photo = null;
      const photoUrl = service.getPhotoUrl(user);
      expect(photoUrl).toEqual('');
    });
  });

  describe('toUserDto', () => {
    const username = 'hardcoded';
    const displayname = 'Testy';
    const user = User.create(username, displayname) as User;
    it('works if a user is provided', () => {
      const userDto = service.toUserDto(user);
      expect(userDto.username).toEqual(username);
      expect(userDto.displayName).toEqual(displayname);
      expect(userDto.photoUrl).toEqual('');
    });
  });

  describe('toFullUserDto', () => {
    const username = 'hardcoded';
    const displayname = 'Testy';
    const user = User.create(username, displayname) as User;
    it('works if a user is provided', () => {
      const userDto = service.toFullUserDto(user);
      expect(userDto.username).toEqual(username);
      expect(userDto.displayName).toEqual(displayname);
      expect(userDto.photoUrl).toEqual('');
      expect(userDto.email).toEqual('');
    });
  });
});
