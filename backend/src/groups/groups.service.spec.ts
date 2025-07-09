/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameGroup, TableGroup } from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import { mockInsert, mockSelect } from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { AlreadyInDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  const groupName = 'test_group';
  const groupDisplayName = 'Test Group';
  const groupId = 42;

  let service: GroupsService;
  let tracker: Tracker;
  let knexProvider: Provider;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService, knexProvider],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, databaseConfigMock],
        }),
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('createGroup', () => {
    it('inserts a new group', async () => {
      mockInsert(tracker, TableGroup, [
        FieldNameGroup.displayName,
        FieldNameGroup.isSpecial,
        FieldNameGroup.name,
      ]);
      await service.createGroup(groupName, groupDisplayName);
      expectBindings(tracker, 'insert', [[groupDisplayName, false, groupName]]);
    });

    it('throws AlreadyInDBError if group already exists', async () => {
      tracker.on
        .insert(
          /^insert into "group" \("display_name", "is_special", "name"\) values .*/,
        )
        .simulateError('duplicate key value violates unique constraint');
      await expect(
        service.createGroup(groupName, groupDisplayName),
      ).rejects.toThrow(AlreadyInDBError);
    });
  });

  describe('getGroupInfoDtoByName', () => {
    it('returns group info if found', async () => {
      const groupRow = {
        [FieldNameGroup.name]: groupName,
        [FieldNameGroup.displayName]: groupDisplayName,
        [FieldNameGroup.isSpecial]: false,
      };
      mockSelect(tracker, [], TableGroup, FieldNameGroup.name, groupRow);
      const result = await service.getGroupInfoDtoByName(groupName);
      expect(result).toEqual({
        name: groupName,
        displayName: groupDisplayName,
        special: false,
      });
      expectBindings(tracker, 'select', [[groupName]], true);
    });

    it('throws NotInDBError if group not found', async () => {
      mockSelect(tracker, [], TableGroup, FieldNameGroup.name, undefined);
      await expect(service.getGroupInfoDtoByName(groupName)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[groupName]], true);
    });
  });

  describe('getGroupIdByName', () => {
    it('returns group id if found', async () => {
      const groupRow = {
        [FieldNameGroup.id]: groupId,
      };
      mockSelect(
        tracker,
        [FieldNameGroup.id],
        TableGroup,
        FieldNameGroup.name,
        groupRow,
      );
      const result = await service.getGroupIdByName(groupName);
      expect(result).toBe(groupId);
      expectBindings(tracker, 'select', [[groupName]], true);
    });

    it('throws NotInDBError if group not found', async () => {
      mockSelect(
        tracker,
        [FieldNameGroup.id],
        TableGroup,
        FieldNameGroup.name,
        undefined,
      );
      await expect(service.getGroupIdByName(groupName)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[groupName]], true);
    });
  });
});
