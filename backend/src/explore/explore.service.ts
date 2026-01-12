/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType, OptionalSortMode, PermissionLevel, SortMode } from '@hedgedoc/commons';
import {
  FieldNameAlias,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameUser,
  FieldNameUserPinnedNote,
  FieldNameVisitedNote,
  SpecialGroup,
  TableAlias,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableRevision,
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
import { PermissionService } from '../permissions/permission.service';
import { RevisionsService } from '../revisions/revisions.service';

export const ENTRIES_PER_PAGE_LIMIT = 20;

export interface QueryResult {
  primaryAlias: string;
  title: string;
  noteType: NoteType;
  ownerUsername: string;
  lastChangedAt: string;
  lastVisitedAt: string | null;
  revisionUuid: string;
}

interface QueryResultWithNoteId extends QueryResult {
  noteId: number;
}

interface QueryResultWithTagList extends QueryResult {
  tags: string[];
}

@Injectable()
export class ExploreService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectConnection()
    private readonly knex: Knex,
    private readonly groupsService: GroupsService,
    private readonly revisionsService: RevisionsService,
    private readonly permissionsService: PermissionService,
  ) {
    this.logger.setContext(ExploreService.name);
  }

  /**
   * Return a list of {@link NoteExploreEntryDto} that the user is owner of.
   *
   * @param userId The user that is the owner
   * @param page Which page of the list is wanted
   * @param noteType Filter which noteType is requested
   * @param sortBy How the list should be sorted
   * @param search An search text to filter the list by
   *
   * @return A list of {@link NoteExploreEntryDto}
   */
  async getMyNoteExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    return await this.knex.transaction(async (transaction) => {
      const queryBase = transaction(TableNote);
      let query = this.applyCommonQuery(queryBase, transaction);
      if (sortBy === SortMode.LAST_VISITED_ASC || sortBy === SortMode.LAST_VISITED_DESC) {
        query = this.joinWithTableVisitedNote(query);
      }
      query = query.andWhere(`${TableNote}.${FieldNameNote.ownerId}`, userId);
      query = this.applyFiltersToQuery(query, noteType, search);
      query = this.applySortingToQuery(query, sortBy);
      query = this.applyPaginationToQuery(query, page);
      const results = (await query) as QueryResult[];
      return await this.transformQueryResultIntoDtos(results, transaction);
    });
  }

  /**
   * Return a list of {@link NoteExploreEntryDto} that are explicitly shared with the user.
   *
   * @param userId The user that the note is shared with
   * @param page Which page of the list is wanted
   * @param noteType Filter which noteType is requested
   * @param sortBy How the list should be sorted
   * @param search An search text to filter the list by
   *
   * @return A list of {@link NoteExploreEntryDto}
   */
  async getSharedWithMeExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    return await this.knex.transaction(async (transaction) => {
      const queryBase = transaction(TableNoteUserPermission).join(
        TableNote,
        `${TableNoteUserPermission}.${FieldNameNoteUserPermission.noteId}`,
        `${TableNote}.${FieldNameNote.id}`,
      );
      let query = this.applyCommonQuery(queryBase, transaction);
      if (sortBy === SortMode.LAST_VISITED_ASC || sortBy === SortMode.LAST_VISITED_DESC) {
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
      return await this.transformQueryResultIntoDtos(results, transaction);
    });
  }

  /**
   * Return a list of {@link NoteExploreEntryDto} for public notes
   *
   * @param page Which page of the list is wanted
   * @param noteType Filter which noteType is requested
   * @param sortBy How the list should be sorted
   * @param search An search text to filter the list by
   *
   * @return A list of {@link NoteExploreEntryDto}
   */
  async getPublicNoteExploreEntries(
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const everyoneGroupId = await this.groupsService.getGroupIdByName(SpecialGroup.EVERYONE);
    return await this.knex.transaction(async (transaction) => {
      const queryBase = transaction(TableNote).join(
        TableNoteGroupPermission,
        `${TableNote}.${FieldNameNote.id}`,
        `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.noteId}`,
      );
      let query = this.applyCommonQuery(queryBase, transaction);
      query = query
        .andWhere(
          `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.groupId}`,
          everyoneGroupId,
        )
        .andWhere(`${TableNote}.${FieldNameNote.publiclyVisible}`, true);
      if (sortBy === SortMode.LAST_VISITED_ASC || sortBy === SortMode.LAST_VISITED_DESC) {
        query = this.joinWithTableVisitedNote(query);
      }
      query = this.applyFiltersToQuery(query, noteType, search);
      query = this.applySortingToQuery(query, sortBy);
      query = this.applyPaginationToQuery(query, page);
      const results = (await query) as QueryResult[];
      return await this.transformQueryResultIntoDtos(results, transaction);
    });
  }

  /**
   * Return a list of {@link NoteExploreEntryDto} that the user has pinned.
   *
   * @param userId The user that has the notes pinned.
   * @return A list of {@link NoteExploreEntryDto}
   */
  async getMyPinnedNoteExploreEntries(userId: number): Promise<NoteExploreEntryDto[]> {
    return await this.knex.transaction(async (transaction) => {
      const queryBase = transaction(TableUserPinnedNote).join(
        TableNote,
        `${TableUserPinnedNote}.${FieldNameUserPinnedNote.noteId}`,
        `${TableNote}.${FieldNameNote.id}`,
      );
      let query = this.applyCommonQuery(queryBase, transaction);
      query = query.andWhere(`${TableUserPinnedNote}.${FieldNameUserPinnedNote.userId}`, userId);
      query = this.applySortingToQuery(query, SortMode.UPDATED_AT_DESC);
      const results = (await query) as QueryResult[];
      return await this.transformQueryResultIntoDtos(results, transaction);
    });
  }

  /**
   * Return a list of {@link NoteExploreEntryDto} that the user recently visited.
   *
   * @param userId The user that has visited the notes
   * @param page Which page of the list is wanted
   * @param noteType Filter which noteType is requested
   * @param sortBy How the list should be sorted
   * @param search An search text to filter the list by
   *
   * @return A list of {@link NoteExploreEntryDto}
   */
  async getRecentlyVisitedNoteExploreEntries(
    userId: number,
    page: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    return await this.knex.transaction(async (transaction) => {
      return await this.innerGetRecentlyVisitedNoteExploreEntries(
        userId,
        page,
        transaction,
        0,
        noteType,
        sortBy,
        search,
      );
    });
  }

  private async innerGetRecentlyVisitedNoteExploreEntries(
    userId: number,
    page: number,
    transaction: Knex.Transaction,
    retry: number,
    noteType?: NoteType | '',
    sortBy?: OptionalSortMode,
    search?: string,
  ): Promise<NoteExploreEntryDto[]> {
    const queryBase = transaction(TableNote);
    let query = this.applyCommonQuery(queryBase, transaction);
    query = query.select({
      lastVisitedAt: `${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`,
      noteId: `${TableNote}.${FieldNameNote.id}`,
    });
    query = this.joinWithTableVisitedNote(query);
    query = query.andWhere(`${TableVisitedNote}.${FieldNameVisitedNote.userId}`, userId);
    query = this.applyFiltersToQuery(query, noteType, search);
    query = this.applySortingToQuery(query, sortBy);
    query = this.applyPaginationToQuery(query, page);
    const results = (await query) as QueryResultWithNoteId[];
    const filteredResults = await this.checkPermissionsAndCleanUpRecentlyVisitedNotes(
      userId,
      results,
      transaction,
    );
    if (retry < 2) {
      // To prevent multiple loops, we only try this once again if we filtered everything out
      if (filteredResults.length === 0 && results.length !== 0) {
        // We filtered everything out, so we need to reevaluate the function
        return await this.innerGetRecentlyVisitedNoteExploreEntries(
          userId,
          page,
          transaction,
          retry + 1,
          noteType,
          sortBy,
          search,
        );
      }
    }
    return await this.transformQueryResultIntoDtos(filteredResults, transaction);
  }

  private async checkPermissionsAndCleanUpRecentlyVisitedNotes(
    userId: number,
    resultWithNoteIds: QueryResultWithNoteId[],
    transaction: Knex.Transaction,
  ): Promise<QueryResultWithNoteId[]> {
    const rejectedNoteIds: number[] = [];
    const permissionLevelPromises = resultWithNoteIds.map((result) =>
      this.permissionsService.determinePermission(userId, result.noteId, transaction),
    );
    const permissionLevels = await Promise.all(permissionLevelPromises);
    for (let i = 0; i < resultWithNoteIds.length; i++) {
      if (permissionLevels[i] === PermissionLevel.DENY) {
        rejectedNoteIds.push(resultWithNoteIds[i].noteId);
        await transaction(TableVisitedNote)
          .where({
            [FieldNameVisitedNote.userId]: userId,
            [FieldNameVisitedNote.noteId]: resultWithNoteIds[i].noteId,
          })
          .delete();
      }
    }
    return resultWithNoteIds.filter((result) => !rejectedNoteIds.includes(result.noteId));
  }

  private async transformQueryResultIntoDtos(
    results: QueryResult[],
    transaction: Knex.Transaction,
  ): Promise<NoteExploreEntryDto[]> {
    const resultsWithTagList: QueryResultWithTagList[] = [];
    const tagsPromises = results.map((result) =>
      this.revisionsService.getTagsByRevisionUuid(result.revisionUuid, transaction),
    );
    const tags = await Promise.all(tagsPromises);
    for (let i = 0; i < results.length; i++) {
      resultsWithTagList.push({ ...results[i], tags: tags[i] });
    }
    return resultsWithTagList.map((result) =>
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

  // oxlint-disable-next-line @typescript-eslint/explicit-function-return-type
  private joinWithTableVisitedNote(query: Knex.QueryBuilder) {
    return query.leftJoin(
      TableVisitedNote,
      `${TableVisitedNote}.${FieldNameVisitedNote.noteId}`,
      `${TableNote}.${FieldNameNote.id}`,
    );
  }

  // The correct return type with all joins and selects is very specific and should just be inferred from Knex
  // oxlint-disable-next-line @typescript-eslint/explicit-function-return-type
  private applyCommonQuery(query: Knex.QueryBuilder, transaction: Knex.Transaction) {
    const subquery = transaction(TableRevision)
      .select(`${FieldNameRevision.uuid}`, `${FieldNameRevision.noteId}`)
      .rowNumber('rn', function () {
        void this.orderBy(FieldNameRevision.createdAt, 'desc').partitionBy(
          FieldNameRevision.noteId,
        );
      })
      .as('latest_revisions_per_note');
    return query
      .select({
        primaryAlias: `${TableAlias}.${FieldNameAlias.alias}`,
        title: `${TableRevision}.${FieldNameRevision.title}`,
        noteType: `${TableRevision}.${FieldNameRevision.noteType}`,
        ownerUsername: `${TableUser}.${FieldNameUser.username}`,
        createdAt: `${TableNote}.${FieldNameNote.createdAt}`,
        lastChangedAt: `${TableRevision}.${FieldNameRevision.createdAt}`,
        revisionUuid: `${TableRevision}.${FieldNameRevision.uuid}`,
      })
      .join(
        TableAlias,
        `${TableAlias}.${FieldNameAlias.noteId}`,
        `${TableNote}.${FieldNameNote.id}`,
      )
      .join(TableUser, `${TableUser}.${FieldNameUser.id}`, `${TableNote}.${FieldNameNote.ownerId}`)
      .join(
        this.knex
          .select(`${FieldNameRevision.uuid}`, `${FieldNameRevision.noteId}`)
          .from(subquery)
          .where('rn', 1)
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
      filteredQuery = filteredQuery.andWhereRaw('LOWER(??) LIKE ?', [
        `${TableRevision}.${FieldNameRevision.title}`,
        `%${searchLowercase}%`,
      ]) as T;
    }
    return filteredQuery;
  }

  private applyPaginationToQuery<T extends Knex.QueryBuilder>(query: T, page: number): T {
    return query.limit(ENTRIES_PER_PAGE_LIMIT).offset((page - 1) * ENTRIES_PER_PAGE_LIMIT) as T;
  }

  private applySortingToQuery<T extends Knex.QueryBuilder>(query: T, sortBy?: OptionalSortMode): T {
    switch (sortBy) {
      case SortMode.TITLE_ASC:
        return query.orderBy(`${TableRevision}.${FieldNameRevision.title}`, 'asc') as T;
      case SortMode.TITLE_DESC:
        return query.orderBy(`${TableRevision}.${FieldNameRevision.title}`, 'desc') as T;
      case SortMode.LAST_VISITED_ASC:
        return query.orderBy(`${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`, 'asc') as T;
      case SortMode.LAST_VISITED_DESC:
        return query.orderBy(`${TableVisitedNote}.${FieldNameVisitedNote.visitedAt}`, 'desc') as T;
      case SortMode.CREATED_AT_ASC:
        return query.orderBy(`${TableNote}.${FieldNameNote.createdAt}`, 'asc') as T;
      case SortMode.CREATED_AT_DESC:
        return query.orderBy(`${TableNote}.${FieldNameNote.createdAt}`, 'desc') as T;
      case SortMode.UPDATED_AT_ASC:
        return query.orderBy(`${TableRevision}.${FieldNameRevision.createdAt}`, 'asc') as T;
      default:
      case SortMode.UPDATED_AT_DESC:
        return query.orderBy(`${TableRevision}.${FieldNameRevision.createdAt}`, 'desc') as T;
    }
  }

  /**
   * Updates the pin status of a specific note for a given user. If the `isPinned` flag is set to true, the note is pinned;
   * otherwise, it is unpinned. When pinning a note, the method ensures no duplicate entries are created. If the note is
   * unpinned, it removes the corresponding entry from the database.
   *
   * @param userId The ID of the user for which the note should be pinned or unpinned.
   * @param noteId The ID of the note to be pinned or unpinned.
   * @param isPinned true to pin the note, false to unpin it.
   * @return The `NoteExploreEntryDto` object for the note if the note was pinned successfully, or `null` if the note was unpinned.
   */
  async setNotePinStatus(
    userId: number,
    noteId: number,
    isPinned: boolean,
  ): Promise<NoteExploreEntryDto | null> {
    return await this.knex.transaction(async (transaction) => {
      if (isPinned) {
        // If the note is already pinned, ignore that
        await transaction(TableUserPinnedNote)
          .insert({
            [FieldNameUserPinnedNote.userId]: userId,
            [FieldNameUserPinnedNote.noteId]: noteId,
          })
          .onConflict([FieldNameUserPinnedNote.userId, FieldNameUserPinnedNote.noteId])
          .ignore();
        const queryBase = transaction(TableNote).where(`${TableNote}.${FieldNameNote.id}`, noteId);
        const query = this.applyCommonQuery(queryBase, transaction);
        const results = (await query) as QueryResult[];
        return (await this.transformQueryResultIntoDtos(results, transaction))[0];
      } else {
        await transaction(TableUserPinnedNote)
          .where({
            [FieldNameUserPinnedNote.userId]: userId,
            [FieldNameUserPinnedNote.noteId]: noteId,
          })
          .delete();
        return null;
      }
    });
  }
}
