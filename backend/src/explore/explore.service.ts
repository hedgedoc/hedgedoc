/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType, OptionalSortMode, SortMode } from '@hedgedoc/commons';
import {
  FieldNameAlias,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameRevisionTag,
  FieldNameUser,
  FieldNameUserPinnedNote,
  FieldNameVisitedNote,
  SpecialGroup,
  TableAlias,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableRevision,
  TableRevisionTag,
  TableUser,
  TableUserPinnedNote,
  TableVisitedNote,
} from '@hedgedoc/database';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { InjectConnection } from 'nest-knexjs';

import { NoteExploreEntryDto } from '../dtos/note-explore-entry.dto';
import { GroupsService } from '../groups/groups.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';

export const ENTRIES_PER_PAGE_LIMIT = 20;

interface QueryResult {
  primaryAlias: string;
  title: string;
  noteType: NoteType;
  ownerUsername: string;
  lastChangedAt: string;
  lastVisitedAt: string | null;
  revisionUuid: string;
  tag: string;
}

interface QueryResultWithTagList extends Omit<QueryResult, 'tag'> {
  tags: string[];
}

@Injectable()
export class ExploreService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectConnection()
    private readonly knex: Knex,
    private readonly groupsService: GroupsService,
  ) {
    this.logger.setContext(ExploreService.name);
  }

  async getMyNoteExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const queryBase = this.knex(TableNote);
    let query = this.applyCommonQuery(queryBase);
    if (
      sortBy === SortMode.LAST_VISITED_ASC ||
      sortBy === SortMode.LAST_VISITED_DESC
    ) {
      query = this.joinWithTableVisitedNote(query);
    }
    query = query.andWhere(`${TableNote}.${FieldNameNote.ownerId}`, userId);
    query = this.applyFiltersToQuery(query, noteType, search);
    query = this.applySortingToQuery(query, sortBy);
    query = this.applyPaginationToQuery(query, page);
    const results = (await query) as QueryResult[];
    return this.transformQueryResultIntoDtos(results);
  }

  async getSharedWithMeExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const queryBase = this.knex(TableNoteUserPermission).join(
      TableNote,
      `${TableNoteUserPermission}.${FieldNameNoteUserPermission.noteId}`,
      `${TableNote}.${FieldNameNote.id}`,
    );
    let query = this.applyCommonQuery(queryBase);
    if (
      sortBy === SortMode.LAST_VISITED_ASC ||
      sortBy === SortMode.LAST_VISITED_DESC
    ) {
      query = this.joinWithTableVisitedNote(query);
    }
    query = query.andWhere(
      `${TableNoteUserPermission}.${FieldNameNoteUserPermission.userId}`,
      userId,
    );
    query = this.applyFiltersToQuery(query, noteType, search);
    query = this.applySortingToQuery(query, sortBy);
    query = this.applyPaginationToQuery(query, page);
    const results = (await query) as QueryResult[];
    return this.transformQueryResultIntoDtos(results);
  }

  async getPublicNoteExploreEntries(
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const everyoneGroupId = await this.groupsService.getGroupIdByName(
      SpecialGroup.EVERYONE,
    );
    const queryBase = this.knex(TableNote).join(
      TableNoteGroupPermission,
      `${TableNote}.${FieldNameNote.id}`,
      `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.noteId}`,
    );
    let query = this.applyCommonQuery(queryBase);
    query = query.andWhere(
      `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.groupId}`,
      everyoneGroupId,
    );
    if (
      sortBy === SortMode.LAST_VISITED_ASC ||
      sortBy === SortMode.LAST_VISITED_DESC
    ) {
      query = this.joinWithTableVisitedNote(query);
    }
    query = this.applyFiltersToQuery(query, noteType, search);
    query = this.applySortingToQuery(query, sortBy);
    query = this.applyPaginationToQuery(query, page);
    const results = (await query) as QueryResult[];
    return this.transformQueryResultIntoDtos(results);
  }

  async getMyPinnedNoteExploreEntries(
    userId: number,
  ): Promise<NoteExploreEntryDto[]> {
    const queryBase = this.knex(TableUserPinnedNote).join(
      TableNote,
      `${TableUserPinnedNote}.${FieldNameUserPinnedNote.noteId}`,
      `${TableNote}.${FieldNameNote.id}`,
    );
    let query = this.applyCommonQuery(queryBase);
    query = query.andWhere(
      `${TableUserPinnedNote}.${FieldNameUserPinnedNote.userId}`,
      userId,
    );
    query = this.applySortingToQuery(query, SortMode.UPDATED_AT_DESC);
    const results = (await query) as QueryResult[];
    return this.transformQueryResultIntoDtos(results);
  }

  async getRecentlyVisitedNoteExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const queryBase = this.knex(TableNote);
    let query = this.applyCommonQuery(queryBase);
    query = query.select({
      lastVisitedAt: `${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`,
    });
    query = this.joinWithTableVisitedNote(query);
    query = query.andWhere(
      `${TableVisitedNote}.${FieldNameVisitedNote.userId}`,
      userId,
    );
    query = this.applyFiltersToQuery(query, noteType, search);
    query = this.applySortingToQuery(query, sortBy);
    query = this.applyPaginationToQuery(query, page);
    const results = (await query) as QueryResult[];
    return this.transformQueryResultIntoDtos(results);
  }

  private transformQueryResultIntoDtos(
    results: QueryResult[],
  ): NoteExploreEntryDto[] {
    const resultsWithTagList = results.reduce((map, result) => {
      const existing = map.get(result.primaryAlias);
      if (!existing) {
        map.set(result.primaryAlias, {
          primaryAlias: result.primaryAlias,
          title: result.title,
          noteType: result.noteType,
          ownerUsername: result.ownerUsername,
          lastChangedAt: result.lastChangedAt,
          lastVisitedAt: result.lastVisitedAt ?? null,
          revisionUuid: result.revisionUuid,
          tags: result.tag ? [result.tag] : [],
        });
      } else if (result.tag) {
        existing.tags.push(result.tag);
      }
      return map;
    }, new Map<string, QueryResultWithTagList>());

    return Array.from(resultsWithTagList.values()).map((result) =>
      NoteExploreEntryDto.create({
        primaryAlias: result.primaryAlias,
        title: result.title,
        type: result.noteType,
        tags: result.tags,
        owner: result.ownerUsername,
        lastChangedAt: DateTime.fromSQL(result.lastChangedAt, {
          zone: 'UTC',
        }).toISO(),
        lastVisitedAt: result.lastVisitedAt
          ? DateTime.fromSQL(result.lastVisitedAt, {
              zone: 'UTC',
            }).toISO()
          : null,
      }),
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private joinWithTableVisitedNote(query: Knex.QueryBuilder) {
    return query.leftJoin(
      TableVisitedNote,
      `${TableVisitedNote}.${FieldNameVisitedNote.noteId}`,
      `${TableNote}.${FieldNameNote.id}`,
    );
  }

  // The correct return type with all joins and selects is very specific and should just be inferred from Knex
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private applyCommonQuery(query: Knex.QueryBuilder) {
    return query
      .select({
        primaryAlias: `${TableAlias}.${FieldNameAlias.alias}`,
        title: `${TableRevision}.${FieldNameRevision.title}`,
        noteType: `${TableRevision}.${FieldNameRevision.noteType}`,
        ownerUsername: `${TableUser}.${FieldNameUser.username}`,
        createdAt: `${TableNote}.${FieldNameNote.createdAt}`,
        lastChangedAt: `${TableRevision}.${FieldNameRevision.createdAt}`,
        revisionUuid: `${TableRevision}.${FieldNameRevision.uuid}`,
        tag: `${TableRevisionTag}.${FieldNameRevisionTag.tag}`,
      })
      .join(
        TableAlias,
        `${TableAlias}.${FieldNameAlias.noteId}`,
        `${TableNote}.${FieldNameNote.id}`,
      )
      .join(
        TableUser,
        `${TableUser}.${FieldNameUser.id}`,
        `${TableNote}.${FieldNameNote.ownerId}`,
      )
      .join(
        this.knex(TableRevision)
          .select(`${FieldNameRevision.uuid}`, `${FieldNameRevision.noteId}`)
          .max(`${FieldNameRevision.createdAt}`)
          .groupBy(`${FieldNameRevision.noteId}`)
          .as('latest_revision'),
        function () {
          this.on(
            `latest_revision.${FieldNameRevision.noteId}`,
            `${TableNote}.${FieldNameNote.id}`,
          );
        },
      )
      .join(TableRevision, function () {
        this.on(
          `${TableRevision}.${FieldNameRevision.noteId}`,
          `${TableNote}.${FieldNameNote.id}`,
        ).andOn(
          `${TableRevision}.${FieldNameRevision.uuid}`,
          `latest_revision.${FieldNameRevision.uuid}`,
        );
      })
      .leftJoin(
        TableRevisionTag,
        `${TableRevisionTag}.${FieldNameRevisionTag.revisionUuid}`,
        `latest_revision.${FieldNameRevision.uuid}`,
      )
      .where(`${TableAlias}.${FieldNameAlias.isPrimary}`, true);
  }

  private applyFiltersToQuery<T extends Knex.QueryBuilder>(
    query: T,
    noteType?: NoteType | '',
    search?: string,
  ): T {
    let filteredQuery = query;
    if (noteType) {
      filteredQuery = filteredQuery.andWhere(
        `${TableRevision}.${FieldNameRevision.noteType}`,
        noteType,
      ) as T;
    }
    if (search) {
      const searchLowercase = search.toLowerCase();
      filteredQuery = filteredQuery.andWhereRaw(
        '(LOWER(??) LIKE ? OR LOWER(??) LIKE ?)',
        [
          `${TableRevision}.${FieldNameRevision.title}`,
          `%${searchLowercase}%`,
          `${TableRevisionTag}.${FieldNameRevisionTag.tag}`,
          `%${searchLowercase}%`,
        ],
      ) as T;
    }
    return filteredQuery;
  }

  private applyPaginationToQuery<T extends Knex.QueryBuilder>(
    query: T,
    page: number,
  ): T {
    return query
      .limit(ENTRIES_PER_PAGE_LIMIT)
      .offset((page - 1) * ENTRIES_PER_PAGE_LIMIT) as T;
  }

  private applySortingToQuery<T extends Knex.QueryBuilder>(
    query: T,
    sortBy?: OptionalSortMode,
  ): T {
    switch (sortBy) {
      case SortMode.TITLE_ASC:
        return query.orderBy(
          `${TableRevision}.${FieldNameRevision.title}`,
          'asc',
        ) as T;
      case SortMode.TITLE_DESC:
        return query.orderBy(
          `${TableRevision}.${FieldNameRevision.title}`,
          'desc',
        ) as T;
      case SortMode.LAST_VISITED_ASC:
        return query.orderBy(
          `${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`,
          'asc',
        ) as T;
      case SortMode.LAST_VISITED_DESC:
        return query.orderBy(
          `${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`,
          'desc',
        ) as T;
      case SortMode.CREATED_AT_ASC:
        return query.orderBy(
          `${TableNote}.${FieldNameNote.createdAt}`,
          'asc',
        ) as T;
      case SortMode.CREATED_AT_DESC:
        return query.orderBy(
          `${TableNote}.${FieldNameNote.createdAt}`,
          'desc',
        ) as T;
      case SortMode.UPDATED_AT_ASC:
        return query.orderBy(
          `${TableRevision}.${FieldNameRevision.createdAt}`,
          'asc',
        ) as T;
      default:
      case SortMode.UPDATED_AT_DESC:
        return query.orderBy(
          `${TableRevision}.${FieldNameRevision.createdAt}`,
          'desc',
        ) as T;
    }
  }

  async setNotePinStatus(
    userId: number,
    noteId: number,
    isPinned: boolean,
  ): Promise<NoteExploreEntryDto | null> {
    if (isPinned) {
      // If note is already pinned, ignore that
      await this.knex(TableUserPinnedNote)
        .insert({
          [FieldNameUserPinnedNote.userId]: userId,
          [FieldNameUserPinnedNote.noteId]: noteId,
        })
        .onConflict([
          FieldNameUserPinnedNote.userId,
          FieldNameUserPinnedNote.noteId,
        ])
        .ignore();
      const queryBase = this.knex(TableNote).where(
        `${TableNote}.${FieldNameNote.id}`,
        noteId,
      );
      const query = this.applyCommonQuery(queryBase);
      const results = (await query) as QueryResult[];
      return this.transformQueryResultIntoDtos(results)[0];
    } else {
      await this.knex(TableUserPinnedNote)
        .where({
          [FieldNameUserPinnedNote.userId]: userId,
          [FieldNameUserPinnedNote.noteId]: noteId,
        })
        .delete();
      return null;
    }
  }
}
