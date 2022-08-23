/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfigMock from '../config/mock/app.config.mock';
import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { Group } from './group.entity';
import { GroupsService } from './groups.service';
import { SpecialGroup } from './groups.special';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupRepo: Repository<Group>;
  let group: Group;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        LoggerModule,
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
    group = Group.create('testGroup', 'Superheros', false) as Group;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    const groupName = 'testGroup';
    const displayname = 'Group Test';
    beforeEach(() => {
      jest
        .spyOn(groupRepo, 'save')
        .mockImplementationOnce(async (group: Group): Promise<Group> => group);
    });
    it('successfully creates a group', async () => {
      const user = await service.createGroup(groupName, displayname);
      expect(user.name).toEqual(groupName);
      expect(user.displayName).toEqual(displayname);
    });
    it('fails if group name is already taken', async () => {
      // add additional mock implementation for failure
      jest.spyOn(groupRepo, 'save').mockImplementationOnce(() => {
        throw new Error();
      });
      // create first group with group name
      await service.createGroup(groupName, displayname);
      // attempt to create second group with group name
      await expect(service.createGroup(groupName, displayname)).rejects.toThrow(
        AlreadyInDBError,
      );
    });
  });

  describe('getGroupByName', () => {
    it('works', async () => {
      jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
      const foundGroup = await service.getGroupByName(group.name);
      expect(foundGroup.name).toEqual(group.name);
      expect(foundGroup.displayName).toEqual(group.displayName);
      expect(foundGroup.special).toEqual(group.special);
    });
    it('fails with non-existing group', async () => {
      jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.getGroupByName('i_dont_exist')).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  it('getEveryoneGroup return EVERYONE group', async () => {
    const spy = jest.spyOn(service, 'getGroupByName').mockImplementation();
    await service.getEveryoneGroup();
    expect(spy).toHaveBeenCalledWith(SpecialGroup.EVERYONE);
  });
  it('getLoggedInGroup return LOGGED_IN group', async () => {
    const spy = jest.spyOn(service, 'getGroupByName').mockImplementation();
    await service.getLoggedInGroup();
    expect(spy).toHaveBeenCalledWith(SpecialGroup.LOGGED_IN);
  });

  describe('toGroupDto', () => {
    it('works', () => {
      const groupDto = service.toGroupDto(group);
      expect(groupDto.displayName).toEqual(group.displayName);
      expect(groupDto.name).toEqual(group.name);
      expect(groupDto.special).toBeFalsy();
    });
  });
});
