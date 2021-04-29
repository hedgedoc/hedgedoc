/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import appConfigMock from '../config/mock/app.config.mock';

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
    group = Group.create('testGroup', 'Superheros');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(undefined);
      await expect(service.getGroupByName('i_dont_exist')).rejects.toThrow(
        NotInDBError,
      );
    });
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
