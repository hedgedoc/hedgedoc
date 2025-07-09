/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameAlias, TableAlias } from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockSelect,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  GenericDBError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { AliasService } from './alias.service';

describe('AliasService', () => {
  const alias1 = 'testAlias1';
  const alias2 = 'testAlias2';
  const noteId1 = 1;

  let service: AliasService;
  let forbiddenNoteId: string;

  let knexProvider: Provider;
  let tracker: Tracker;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AliasService, knexProvider],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
        }),
      ],
    }).compile();

    const config = module.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('noteConfig').forbiddenNoteIds[0];
    service = module.get<AliasService>(AliasService);
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('generateRandomAlias', () => {
    it('generates a 26 character long string', () => {
      const randomId = service.generateRandomAlias();
      // 16 bytes encoded as base32 with Crockford results in 26 characters
      expect(randomId).toHaveLength(26);
    });
  });

  describe('addAlias', () => {
    describe('creates', () => {
      it('a primary alias if no aliases are already present', async () => {
        mockSelect(
          tracker,
          [FieldNameAlias.alias],
          TableAlias,
          FieldNameAlias.noteId,
          [],
        );
        mockInsert(tracker, TableAlias, [
          FieldNameAlias.alias,
          FieldNameAlias.isPrimary,
          FieldNameAlias.noteId,
        ]);
        await service.addAlias(noteId1, alias1);
        expectBindings(tracker, 'select', [[noteId1]]);
        expectBindings(tracker, 'insert', [[alias1, true, noteId1]]);
      });

      it('a non-primary alias if a primary alias is already present', async () => {
        mockSelect(
          tracker,
          [FieldNameAlias.alias],
          TableAlias,
          FieldNameAlias.noteId,
          [alias2],
        );
        mockInsert(tracker, TableAlias, [
          FieldNameAlias.alias,
          FieldNameAlias.isPrimary,
          FieldNameAlias.noteId,
        ]);
        await service.addAlias(noteId1, alias2);
        expectBindings(tracker, 'select', [[noteId1]]);
        expectBindings(tracker, 'insert', [[alias2, false, noteId1]]);
      });
    });
  });

  describe('makeAliasPrimary', () => {
    it('marks the alias as primary', async () => {
      mockUpdate(
        tracker,
        TableAlias,
        [FieldNameAlias.isPrimary],
        FieldNameAlias.noteId,
      );

      mockUpdate(
        tracker,
        TableAlias,
        [FieldNameAlias.isPrimary],
        FieldNameAlias.noteId,
      );

      await service.makeAliasPrimary(noteId1, alias2);

      expectBindings(tracker, 'update', [
        [null, noteId1],
        [true, noteId1, alias2],
      ]);
    });
    it('does not mark the aliases as primary, if the alias does not exist', async () => {
      mockUpdate(
        tracker,
        TableAlias,
        [FieldNameAlias.isPrimary],
        FieldNameAlias.noteId,
        [],
      );
      await expect(
        service.makeAliasPrimary(noteId1, 'i_dont_exist'),
      ).rejects.toThrow(GenericDBError);
      expectBindings(tracker, 'update', [[null, noteId1]]);
    });
    it("does not mark the aliases as primary, if the alias can't be made primary", async () => {
      mockUpdate(
        tracker,
        TableAlias,
        [FieldNameAlias.isPrimary],
        FieldNameAlias.noteId,
        [
          {
            [FieldNameAlias.isPrimary]: null,
          },
        ],
      );
      await expect(
        service.makeAliasPrimary(noteId1, 'i_dont_exist'),
      ).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'update', [
        [null, noteId1],
        [true, noteId1, 'i_dont_exist'],
      ]);
    });
  });

  describe('removeAlias', () => {
    it('fails if alias does not exist', async () => {
      mockSelect(tracker, [], TableAlias, FieldNameAlias.alias);
      await expect(service.removeAlias(alias1)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[alias1]]);
    });

    it('fails if alias is primary', async () => {
      mockSelect(tracker, [], TableAlias, FieldNameAlias.alias, [
        {
          [FieldNameAlias.alias]: alias1,
          [FieldNameAlias.noteId]: noteId1,
          [FieldNameAlias.isPrimary]: true,
        },
      ]);
      mockDelete(
        tracker,
        TableAlias,
        [FieldNameAlias.alias, FieldNameAlias.noteId, FieldNameAlias.isPrimary],
        0,
      );
      await expect(service.removeAlias(alias1)).rejects.toThrow(
        PrimaryAliasDeletionForbiddenError,
      );
      expectBindings(tracker, 'select', [[alias1]]);
      expectBindings(tracker, 'delete', [[alias1, noteId1]]);
    });

    it('correctly deletes the alias', async () => {
      mockSelect(tracker, [], TableAlias, FieldNameAlias.alias, [
        {
          [FieldNameAlias.alias]: alias2,
          [FieldNameAlias.noteId]: noteId1,
          [FieldNameAlias.isPrimary]: false,
        },
      ]);
      mockDelete(tracker, TableAlias, [
        FieldNameAlias.alias,
        FieldNameAlias.noteId,
        FieldNameAlias.isPrimary,
      ]);
      await service.removeAlias(alias2);
      expectBindings(tracker, 'select', [[alias2]]);
      expectBindings(tracker, 'delete', [[alias2, noteId1]]);
    });
  });

  describe('getPrimaryAliasByNoteId', () => {
    it('does not return alias if note does not exits', async () => {
      mockSelect(
        tracker,
        [FieldNameAlias.alias],
        TableAlias,
        [FieldNameAlias.noteId, FieldNameAlias.isPrimary],
        [],
      );
      await expect(service.getPrimaryAliasByNoteId(noteId1)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[noteId1, true]], true);
    });

    it('return primary alias', async () => {
      mockSelect(
        tracker,
        [FieldNameAlias.alias],
        TableAlias,
        [FieldNameAlias.noteId, FieldNameAlias.isPrimary],
        {
          [FieldNameAlias.alias]: alias1,
        },
      );
      const result = await service.getPrimaryAliasByNoteId(noteId1);
      expect(result).toEqual(alias1);
      expectBindings(tracker, 'select', [[noteId1, true]], true);
    });
  });

  describe('getAllAliases', () => {
    it('throws an error if a note has no aliases', async () => {
      mockSelect(
        tracker,
        [FieldNameAlias.alias],
        TableAlias,
        [FieldNameAlias.noteId, FieldNameAlias.isPrimary],
        [],
      );
      await expect(service.getPrimaryAliasByNoteId(noteId1)).rejects.toThrow(
        NotInDBError,
      );
    });

    it('returns all aliases for a note', async () => {
      const alias1Object = {
        [FieldNameAlias.alias]: alias1,
        [FieldNameAlias.noteId]: noteId1,
        [FieldNameAlias.isPrimary]: true,
      };
      const alias2Object = {
        [FieldNameAlias.alias]: alias2,
        [FieldNameAlias.noteId]: noteId1,
        [FieldNameAlias.isPrimary]: null,
      };
      mockSelect(
        tracker,
        [FieldNameAlias.alias, FieldNameAlias.isPrimary],
        TableAlias,
        [FieldNameAlias.noteId],
        [alias1Object, alias2Object],
      );
      const aliases = await service.getAllAliases(1);
      expect(aliases).toEqual([alias1Object, alias2Object]);
    });
  });

  describe('ensureAliasIsAvailable', () => {
    it('throws ForbiddenIdError for forbidden aliases', async () => {
      await expect(
        service.ensureAliasIsAvailable(forbiddenNoteId),
      ).rejects.toThrow(ForbiddenIdError);
    });
    it('throws AlreadyInDBError for already used aliases', async () => {
      mockSelect(
        tracker,
        [FieldNameAlias.alias],
        TableAlias,
        FieldNameAlias.alias,
        [
          {
            [FieldNameAlias.alias]: alias1,
          },
        ],
      );
      await expect(service.ensureAliasIsAvailable(alias1)).rejects.toThrow(
        AlreadyInDBError,
      );
      expectBindings(tracker, 'select', [[alias1]]);
    });
    it('returns void if alias can be used', async () => {
      mockSelect(
        tracker,
        [FieldNameAlias.alias],
        TableAlias,
        FieldNameAlias.alias,
        [],
      );
      await service.ensureAliasIsAvailable(alias1);
      expectBindings(tracker, 'select', [[alias1]]);
    });
  });

  describe('isAliasForbidden', () => {
    it('returns true for forbidden aliases', async () => {
      const result = service.isAliasForbidden(forbiddenNoteId);
      expect(result).toBe(true);
    });
    it('return false for other aliases', async () => {
      const result = service.isAliasForbidden(alias1);
      expect(result).toBe(false);
    });
  });

  describe('toAliasDto correctly creates an AliasDto', () => {
    it('with a primary alias', () => {
      const primaryAliasDto = service.toAliasDto(alias1, true);
      expect(primaryAliasDto.name).toEqual(alias1);
      expect(primaryAliasDto.isPrimaryAlias).toBe(true);
    });
    it('with a non-primary alias', () => {
      const nonPrimaryAliasDto = service.toAliasDto(alias2, false);
      expect(nonPrimaryAliasDto.name).toEqual(alias2);
      expect(nonPrimaryAliasDto.isPrimaryAlias).toBe(false);
    });
  });
});
