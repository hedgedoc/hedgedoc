/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FieldNameRevision,
  FieldNameRevisionTag,
  TableRevision,
  TableRevisionTag,
} from '@hedgedoc/database';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import { AliasService } from '../alias/alias.service';
import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { RevisionsService } from './revisions.service';

describe('RevisionsService', () => {
  let service: RevisionsService;
  let tracker: Tracker;
  let knexProvider: any;

  const noteId = 42;
  const revisionUuid = 'rev-uuid-123';
  const content = 'Revision content';
  const patch = 'patch-content';
  const title = 'Note Title';
  const description = 'Note Description';
  const tag = 'tag1';

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevisionsService,
        knexProvider,
        {
          provide: AliasService,
          useValue: {
            getPrimaryAliasByNoteId: jest.fn().mockResolvedValue('alias'),
          },
        },
        { provide: 'NoteConfig', useValue: { revisionRetentionDays: 7 } },
      ],
      imports: [LoggerModule],
    }).compile();

    service = module.get<RevisionsService>(RevisionsService);
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('createRevision', () => {
    it('inserts a new revision', async () => {
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.content,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.description,
          FieldNameRevision.yjsStateVector,
        ],
        [{ [FieldNameRevision.uuid]: revisionUuid }],
      );
      // No tags
      await service['innerCreateRevision'](
        noteId,
        content,
        true,
        service['knex'],
      );
      expectBindings(tracker, 'insert', [
        [
          expect.objectContaining({
            note_id: noteId,
            content,
          }),
        ],
      ]);
    });

    it('throws GenericDBError if insert fails', async () => {
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.content,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.description,
          FieldNameRevision.yjsStateVector,
        ],
        [],
      );
      await expect(
        service['innerCreateRevision'](noteId, content, true, service['knex']),
      ).rejects.toThrow(GenericDBError);
    });

    it('inserts tags if present', async () => {
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.content,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.description,
          FieldNameRevision.yjsStateVector,
        ],
        [{ [FieldNameRevision.uuid]: revisionUuid }],
      );
      mockInsert(
        tracker,
        TableRevisionTag,
        [FieldNameRevisionTag.tag, FieldNameRevisionTag.revisionUuid],
        [{}],
      );
      // Patch extractRevisionMetadataFromContent to return a tag
      jest
        .spyOn(
          require('./utils/extract-revision-metadata-from-content'),
          'extractRevisionMetadataFromContent',
        )
        .mockReturnValue({ title, description, tags: [tag], noteType: null });
      await service['innerCreateRevision'](
        noteId,
        content,
        true,
        service['knex'],
      );
      expectBindings(tracker, 'insert', [
        expect.any(Array), // revision insert
        [
          expect.objectContaining({
            tag,
            revision_uuid: revisionUuid,
          }),
        ],
      ]);
    });
  });

  describe('removeOldRevisions', () => {
    it('deletes old revisions', async () => {
      mockDelete(tracker, TableRevision, FieldNameRevision.createdAt, [
        { [FieldNameRevision.noteId]: noteId },
      ]);
      // Mock update for patch update
      mockUpdate(tracker, TableRevision, FieldNameRevision.uuid, 1);
      // Mock join/select for revisionsToUpdate
      tracker.queries.push({
        method: 'select',
        response: [
          {
            [FieldNameRevision.uuid]: revisionUuid,
            [FieldNameRevision.noteId]: noteId,
            [FieldNameRevision.content]: content,
            alias: 'alias',
          },
        ],
      });
      await service.removeOldRevisions();
      expectBindings(tracker, 'delete', [[expect.anything()]]);
      expectBindings(tracker, 'update', [
        [FieldNameRevision.patch, expect.any(String), revisionUuid],
      ]);
    });
  });
});
