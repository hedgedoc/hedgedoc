/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers \(see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SortMode } from '@hedgedoc/commons';
import { OptionalNoteType, OptionalSortMode } from '@hedgedoc/commons';
import {
  FieldNameGroup,
  FieldNameUserPinnedNote,
  NoteType,
  TableGroup,
  TableUserPinnedNote,
} from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Tracker } from 'knex-mock-client';
import { DateTime } from 'luxon';

import { AliasService } from '../alias/alias.service';
import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { expectBindings, IS_FIRST } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockQuery,
  mockSelect,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { LoggerModule } from '../logger/logger.module';
import { NoteService } from '../notes/note.service';
import { PermissionService } from '../permissions/permission.service';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RevisionsService } from '../revisions/revisions.service';
import { UsersService } from '../users/users.service';
import {
  dateTimeToDB,
  dateTimeToISOString,
  getCurrentDateTime,
} from '../utils/datetime';
import { ENTRIES_PER_PAGE_LIMIT, ExploreService } from './explore.service';

describe('ExploreService', () => {
  let service: ExploreService;
  let tracker: Tracker;
  let knexProvider: Provider;

  let now: DateTime;
  let selectedRows: unknown;

  const mockUserId = 42;
  const mockUsername = 'TestUser';

  const mockNoteId = 123;
  const mockPrimaryAlias = 'mockPrimaryAlias';
  const mockTitle = 'mockTitle';
  const mockNoteType = NoteType.DOCUMENT;
  const mockRevisionUuid = 'b9d6b014-dbf3-45b7-96b0-14dbf355b705';
  const mockTag = 'mockTag';
  const mockEveryoneGroupId = 25;

  const pageNumber = 1;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        knexProvider,
        GroupsService,
        RevisionsService,
        AliasService,
        PermissionService,
        RealtimeNoteStore,
        EventEmitter2<NoteEventMap>,
        UsersService,
        ExploreService,
      ],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, databaseConfigMock, noteConfigMock],
        }),
      ],
    }).compile();

    service = module.get<ExploreService>(ExploreService);
  });

  beforeEach(() => {
    jest.useFakeTimers();
    now = getCurrentDateTime();
    selectedRows = [
      {
        primaryAlias: mockPrimaryAlias,
        title: mockTitle,
        noteType: mockNoteType,
        ownerUsername: mockUsername,
        createdAt: dateTimeToDB(now),
        revisionUuid: mockRevisionUuid,
        lastChangedAt: dateTimeToDB(now),
        tag: mockTag,
      },
    ];
  });

  afterEach(() => {
    tracker.reset();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  describe('getMyNoteExploreEntries', () => {
    describe.each([
      [
        'no filter',
        '',
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note"."owner_id" = \$3 order by "revision"."created_at" desc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'type filter',
        NoteType.SLIDE,
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note"."owner_id" = \$3 and "revision"."note_type" = \$4 order by "revision"."created_at" desc limit \$5/,
        [1, true, mockUserId, NoteType.SLIDE, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'sorting',
        '',
        SortMode.TITLE_ASC,
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note"."owner_id" = \$3 order by "revision"."title" asc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'search filter',
        '',
        '',
        'test',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note"."owner_id" = \$3 and \(LOWER\("revision"."title"\) LIKE \$4 OR LOWER\("revision_tag"."tag"\) LIKE \$5\) order by "revision"."created_at" desc limit \$6/,
        [1, true, mockUserId, '%test%', '%test%', ENTRIES_PER_PAGE_LIMIT],
      ],
    ] as [
      string,
      OptionalNoteType,
      OptionalSortMode,
      string,
      RegExp,
      unknown[],
    ][])(
      'correctly get all notes owned by user with',
      (name, noteType, sortBy, search, regex, bindings) => {
        // eslint-disable-next-line jest/valid-title
        it(name, async () => {
          mockQuery('select', tracker, regex, selectedRows);
          const exploreEntries = await service.getMyNoteExploreEntries(
            mockUserId,
            pageNumber,
            noteType,
            sortBy,
            search,
          );
          expect(exploreEntries.length).toBe(1);
          expect(exploreEntries[0]).toEqual({
            primaryAlias: mockPrimaryAlias,
            title: mockTitle,
            type: mockNoteType,
            tags: [mockTag],
            owner: mockUsername,
            lastChangedAt: dateTimeToISOString(now),
            lastVisitedAt: null,
          });
          expectBindings(tracker, 'select', [bindings]);
        });
      },
    );
  });

  describe('getSharedWithMeExploreEntries', () => {
    describe.each([
      [
        'no filter',
        '',
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note_user_permission" inner join "note" on "note_user_permission"."note_id" = "note"."id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_user_permission"."user_id" = \$3 order by "revision"."created_at" desc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'type filter',
        NoteType.SLIDE,
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note_user_permission" inner join "note" on "note_user_permission"."note_id" = "note"."id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_user_permission"."user_id" = \$3 and "revision"."note_type" = \$4 order by "revision"."created_at" desc limit \$5/,
        [1, true, mockUserId, NoteType.SLIDE, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'sorting',
        '',
        SortMode.TITLE_ASC,
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note_user_permission" inner join "note" on "note_user_permission"."note_id" = "note"."id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_user_permission"."user_id" = \$3 order by "revision"."title" asc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'search filter',
        '',
        '',
        'test',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note_user_permission" inner join "note" on "note_user_permission"."note_id" = "note"."id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_user_permission"."user_id" = \$3 and \(LOWER\("revision"."title"\) LIKE \$4 OR LOWER\("revision_tag"."tag"\) LIKE \$5\) order by "revision"."created_at" desc limit \$6/,
        [1, true, mockUserId, '%test%', '%test%', ENTRIES_PER_PAGE_LIMIT],
      ],
    ] as [
      string,
      OptionalNoteType,
      OptionalSortMode,
      string,
      RegExp,
      unknown[],
    ][])(
      'correctly get all notes shared with the user with',
      (name, noteType, sortBy, search, regex, bindings) => {
        // eslint-disable-next-line jest/valid-title
        it(name, async () => {
          mockQuery('select', tracker, regex, selectedRows);
          const exploreEntries = await service.getSharedWithMeExploreEntries(
            mockUserId,
            pageNumber,
            noteType,
            sortBy,
            search,
          );
          expect(exploreEntries.length).toBe(1);
          expect(exploreEntries[0]).toEqual({
            primaryAlias: mockPrimaryAlias,
            title: mockTitle,
            type: mockNoteType,
            tags: [mockTag],
            owner: mockUsername,
            lastChangedAt: dateTimeToISOString(now),
            lastVisitedAt: null,
          });
          expectBindings(tracker, 'select', [bindings]);
        });
      },
    );
  });

  describe('getPublicNoteExploreEntries', () => {
    describe.each([
      [
        'no filter',
        '',
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "note_group_permission" on "note"."id" = "note_group_permission"."note_id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_group_permission"."group_id" = \$3 order by "revision"."created_at" desc limit \$4/,
        [1, true, mockEveryoneGroupId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'type filter',
        NoteType.SLIDE,
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "note_group_permission" on "note"."id" = "note_group_permission"."note_id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_group_permission"."group_id" = \$3 and "revision"."note_type" = \$4 order by "revision"."created_at" desc limit \$5/,
        [1, true, mockEveryoneGroupId, NoteType.SLIDE, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'sorting',
        '',
        SortMode.TITLE_ASC,
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "note_group_permission" on "note"."id" = "note_group_permission"."note_id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_group_permission"."group_id" = \$3 order by "revision"."title" asc limit \$4/,
        [1, true, mockEveryoneGroupId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'search filter',
        '',
        '',
        'test',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "note_group_permission" on "note"."id" = "note_group_permission"."note_id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "note_group_permission"."group_id" = \$3 and \(LOWER\("revision"."title"\) LIKE \$4 OR LOWER\("revision_tag"."tag"\) LIKE \$5\) order by "revision"."created_at" desc limit \$6/,
        [
          1,
          true,
          mockEveryoneGroupId,
          '%test%',
          '%test%',
          ENTRIES_PER_PAGE_LIMIT,
        ],
      ],
    ] as [
      string,
      OptionalNoteType,
      OptionalSortMode,
      string,
      RegExp,
      unknown[],
    ][])(
      'correctly get all public notes with',
      (name, noteType, sortBy, search, regex, bindings) => {
        // eslint-disable-next-line jest/valid-title
        it(name, async () => {
          mockSelect(
            tracker,
            [FieldNameGroup.id],
            TableGroup,
            FieldNameGroup.name,
            [
              {
                [FieldNameGroup.id]: mockEveryoneGroupId,
                [FieldNameGroup.name]: '_EVERYONE',
                [FieldNameGroup.displayName]: 'Everyone',
                [FieldNameGroup.isSpecial]: true,
              },
            ],
          );
          mockQuery('select', tracker, regex, selectedRows);
          const exploreEntries = await service.getPublicNoteExploreEntries(
            pageNumber,
            noteType,
            sortBy,
            search,
          );
          expect(exploreEntries.length).toBe(1);
          expect(exploreEntries[0]).toEqual({
            primaryAlias: mockPrimaryAlias,
            title: mockTitle,
            type: mockNoteType,
            tags: [mockTag],
            owner: mockUsername,
            lastChangedAt: dateTimeToISOString(now),
            lastVisitedAt: null,
          });
          expectBindings(tracker, 'select', [
            ['_EVERYONE', IS_FIRST],
            bindings,
          ]);
        });
      },
    );
  });

  describe('getMyPinnedNoteExploreEntries', () => {
    it('correctly return all pinned notes of the user', async () => {
      mockQuery(
        'select',
        tracker,
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "user_pinned_note" inner join "note" on "user_pinned_note"."note_id" = "note"."id" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "alias"."is_primary" = \$2 and "user_pinned_note"."user_id" = \$3 order by "revision"."created_at" desc/,
        selectedRows,
      );
      const exploreEntries =
        await service.getMyPinnedNoteExploreEntries(mockUserId);
      expect(exploreEntries.length).toBe(1);
      expect(exploreEntries[0]).toEqual({
        primaryAlias: mockPrimaryAlias,
        title: mockTitle,
        type: mockNoteType,
        tags: [mockTag],
        owner: mockUsername,
        lastChangedAt: dateTimeToISOString(now),
        lastVisitedAt: null,
      });
      expectBindings(tracker, 'select', [[1, true, mockUserId]]);
    });
  });
  describe('getRecentlyVisitedNoteExploreEntries', () => {
    describe.each([
      [
        'no filter',
        '',
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag", "visited_notes"."visited_at" as "lastVisitedAt" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" left join "visited_notes" on "visited_notes"."note_id" = "note"."id" where "alias"."is_primary" = \$2 and "visited_notes"."user_id" = \$3 order by "revision"."created_at" desc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'type filter',
        NoteType.SLIDE,
        '',
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag", "visited_notes"."visited_at" as "lastVisitedAt" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" left join "visited_notes" on "visited_notes"."note_id" = "note"."id" where "alias"."is_primary" = \$2 and "visited_notes"."user_id" = \$3 and "revision"."note_type" = \$4 order by "revision"."created_at" desc limit \$5/,
        [1, true, mockUserId, NoteType.SLIDE, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'sorting',
        '',
        SortMode.TITLE_ASC,
        '',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag", "visited_notes"."visited_at" as "lastVisitedAt" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" left join "visited_notes" on "visited_notes"."note_id" = "note"."id" where "alias"."is_primary" = \$2 and "visited_notes"."user_id" = \$3 order by "revision"."title" asc limit \$4/,
        [1, true, mockUserId, ENTRIES_PER_PAGE_LIMIT],
      ],
      [
        'search filter',
        '',
        '',
        'test',
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag", "visited_notes"."visited_at" as "lastVisitedAt" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" left join "visited_notes" on "visited_notes"."note_id" = "note"."id" where "alias"."is_primary" = \$2 and "visited_notes"."user_id" = \$3 and \(LOWER\("revision"."title"\) LIKE \$4 OR LOWER\("revision_tag"."tag"\) LIKE \$5\) order by "revision"."created_at" desc limit \$6/,
        [1, true, mockUserId, '%test%', '%test%', ENTRIES_PER_PAGE_LIMIT],
      ],
    ] as [
      string,
      OptionalNoteType,
      OptionalSortMode,
      string,
      RegExp,
      unknown[],
    ][])(
      'correctly get all notes visited by the user with',
      (name, noteType, sortBy, search, regex, bindings) => {
        // eslint-disable-next-line jest/valid-title
        it(name, async () => {
          mockQuery('select', tracker, regex, selectedRows);
          const exploreEntries =
            await service.getRecentlyVisitedNoteExploreEntries(
              mockUserId,
              pageNumber,
              noteType,
              sortBy,
              search,
            );
          expect(exploreEntries.length).toBe(1);
          expect(exploreEntries[0]).toEqual({
            primaryAlias: mockPrimaryAlias,
            title: mockTitle,
            type: mockNoteType,
            tags: [mockTag],
            owner: mockUsername,
            lastChangedAt: dateTimeToISOString(now),
            lastVisitedAt: null,
          });
          expectBindings(tracker, 'select', [bindings]);
        });
      },
    );
  });

  describe('setNotePinStatus', () => {
    it('pins note', async () => {
      //
      mockQuery(
        'insert',
        tracker,
        /insert into "user_pinned_note" \("note_id", "user_id"\) values \(\$1, \$2\) on conflict \("user_id", "note_id"\) do nothing/,
        selectedRows,
      );
      mockQuery(
        'select',
        tracker,
        /select "alias"."alias" as "primaryAlias", "revision"."title" as "title", "revision"."note_type" as "noteType", "user"."username" as "ownerUsername", "note"."created_at" as "createdAt", "revision"."created_at" as "lastChangedAt", "revision"."uuid" as "revisionUuid", "revision_tag"."tag" as "tag" from "note" inner join "alias" on "alias"."note_id" = "note"."id" inner join "user" on "user"."id" = "note"."owner_id" inner join \(select "uuid", "note_id" from \(select "uuid", "note_id", row_number\(\) over \(partition by "note_id" order by "created_at" desc\) as rn from "revision"\) where "rn" = \$1\) as "latest_revision" on "latest_revision"."note_id" = "note"."id" inner join "revision" on "revision"."note_id" = "note"."id" and "revision"."uuid" = "latest_revision"."uuid" left join "revision_tag" on "revision_tag"."revision_id" = "latest_revision"."uuid" where "note"."id" = \$2 and "alias"."is_primary" = \$3/,
        selectedRows,
      );
      await service.setNotePinStatus(mockUserId, mockNoteId, true);
      expectBindings(tracker, 'select', [[1, mockNoteId, true]]);
    });

    it('unpins note', async () => {
      mockDelete(
        tracker,
        TableUserPinnedNote,
        [FieldNameUserPinnedNote.userId, FieldNameUserPinnedNote.noteId],
        1,
      );
      await service.setNotePinStatus(mockUserId, mockNoteId, false);
      expectBindings(tracker, 'delete', [[mockUserId, mockNoteId]]);
    });
  });
});
