/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthorshipInfo,
  FieldNameAlias,
  FieldNameAuthorshipInfo,
  FieldNameNote,
  FieldNameRevision,
  FieldNameRevisionTag,
  FieldNameUser,
  Note,
  Revision,
  RevisionTag,
  TableAlias,
  TableAuthorshipInfo,
  TableRevision,
  TableRevisionTag,
  TableUser,
  User,
} from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { createPatch } from 'diff';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { v7 as uuidv7 } from 'uuid';

import { AliasService } from '../alias/alias.service';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import { RevisionMetadataDto } from '../dtos/revision-metadata.dto';
import { RevisionDto } from '../dtos/revision.dto';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { extractRevisionMetadataFromContent } from './utils/extract-revision-metadata-from-content';

interface RevisionUserInfo {
  users: {
    username: string;
    createdAt: AuthorshipInfo[FieldNameAuthorshipInfo.createdAt];
  }[];
  guestUserCount: number;
}

@Injectable()
export class RevisionsService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly aliasService: AliasService,
    @InjectConnection()
    private readonly knex: Knex,
    @Inject(noteConfiguration.KEY) private noteConfig: NoteConfig,
  ) {
    this.logger.setContext(RevisionsService.name);
  }

  /**
   * Returns all revisions of a note
   *
   * @param noteId The id of the note
   * @returns The list of revisions
   */
  async getAllRevisionMetadataDto(
    noteId: number,
  ): Promise<RevisionMetadataDto[]> {
    const noteRevisions = await this.knex(TableRevision)
      .distinct<
        (Pick<
          Revision,
          | FieldNameRevision.uuid
          | FieldNameRevision.createdAt
          | FieldNameRevision.content
          | FieldNameRevision.title
          | FieldNameRevision.description
        > &
          Pick<User, FieldNameUser.username | FieldNameUser.guestUuid> &
          Pick<RevisionTag, FieldNameRevisionTag.tag>)[]
      >(`${TableRevision}.${FieldNameRevision.uuid}`, `${TableRevision}.${FieldNameRevision.createdAt}`, `${TableRevision}.${FieldNameRevision.description}`, `${TableRevision}.${FieldNameRevision.content}`, `${TableRevision}.${FieldNameRevision.title}`, `${TableUser}.${FieldNameUser.username}`, `${TableUser}.${FieldNameUser.guestUuid}`, `${TableRevisionTag}.${FieldNameRevisionTag.tag}`)
      .join(
        TableRevisionTag,
        `${TableRevisionTag}.${FieldNameRevisionTag.revisionUuid}`,
        `${TableRevision}.${FieldNameRevision.uuid}`,
      )
      .join(
        TableAuthorshipInfo,
        `${TableAuthorshipInfo}.${FieldNameAuthorshipInfo.revisionUuid}`,
        `${TableRevision}.${FieldNameRevision.uuid}`,
      )
      .join(
        TableUser,
        `${TableUser}.${FieldNameUser.id}`,
        `${TableAuthorshipInfo}.${FieldNameAuthorshipInfo.authorId}`,
      )
      .orderBy(`${TableRevision}.${FieldNameRevision.createdAt}`, 'desc')
      .orderBy(`${TableRevision}.${FieldNameRevision.uuid}`)
      .where(FieldNameRevision.noteId, noteId);

    const revisionMap = noteRevisions.reduce((recordMap, revision) => {
      const currentMappedRevision = recordMap.get(
        revision[FieldNameRevision.uuid],
      );
      if (currentMappedRevision !== undefined) {
        const authorUsernames = currentMappedRevision.authorUsernames;
        const authorGuestUuids = currentMappedRevision.authorGuestUuids;
        const tags = currentMappedRevision.tags;
        if (revision[FieldNameUser.username] !== null) {
          if (!authorUsernames.includes(revision[FieldNameUser.username])) {
            authorUsernames.push(revision[FieldNameUser.username]);
          }
        }
        if (revision[FieldNameUser.guestUuid] !== null) {
          if (!authorGuestUuids.includes(revision[FieldNameUser.guestUuid])) {
            authorGuestUuids.push(revision[FieldNameUser.guestUuid]);
          }
        }
        if (revision[FieldNameRevisionTag.tag] !== null) {
          if (!tags.includes(revision[FieldNameRevisionTag.tag])) {
            tags.push(revision[FieldNameRevisionTag.tag]);
          }
        }
        recordMap.set(
          revision[FieldNameRevision.uuid],
          RevisionMetadataDto.create({
            ...currentMappedRevision,
            authorUsernames,
            authorGuestUuids,
            tags,
          }),
        );
      } else {
        recordMap.set(revision[FieldNameRevision.uuid], {
          uuid: revision[FieldNameRevision.uuid],
          length: (revision[FieldNameRevision.content] ?? '').length,
          createdAt: revision[FieldNameRevision.createdAt],
          authorUsernames:
            revision[FieldNameUser.username] !== null
              ? [revision[FieldNameUser.username]]
              : [],
          authorGuestUuids:
            revision[FieldNameUser.guestUuid] !== null
              ? [revision[FieldNameUser.guestUuid]]
              : [],
          title: revision[FieldNameRevision.title],
          description: revision[FieldNameRevision.description],
          tags:
            revision[FieldNameRevisionTag.tag] !== null
              ? [revision[FieldNameRevisionTag.tag]]
              : [],
        });
      }
      return recordMap;
    }, new Map<string, RevisionMetadataDto>());

    return [...revisionMap.values()];
  }

  /**
   * Purge revision history of a note.
   * After this we don't know how anyone came to the content of the note.
   * We only know the content of the note.
   *
   * @param noteId Id of the note to purge the history
   */
  async purgeRevisions(noteId: Note[FieldNameNote.id]): Promise<void> {
    await this.knex.transaction(async (transaction) => {
      const allRevisions = await transaction(TableRevision)
        .select()
        .where(FieldNameRevision.noteId, noteId)
        .orderBy(FieldNameRevision.createdAt, 'desc');
      if (allRevisions.length === 0) {
        this.logger.debug(`No revisions found for note ${noteId}`);
        return;
      }
      const latestRevision = allRevisions[0];
      const revisionsToDelete = allRevisions.filter(
        (revision) =>
          revision[FieldNameRevision.uuid] !==
          latestRevision[FieldNameRevision.uuid],
      );
      const idsToDelete = revisionsToDelete.map(
        (revision) => revision[FieldNameRevision.uuid],
      );
      await transaction(TableRevision)
        .whereIn(FieldNameRevision.uuid, idsToDelete)
        .delete();
      const notePrimaryAlias =
        await this.aliasService.getPrimaryAliasByNoteId(noteId);
      const newPatch = createPatch(
        notePrimaryAlias,
        '',
        latestRevision[FieldNameRevision.content],
      );
      await transaction(TableRevision)
        .update(FieldNameRevision.patch, newPatch)
        .where(FieldNameRevision.uuid, latestRevision[FieldNameRevision.uuid]);
    });
  }

  /**
   * Get a revision by its UUID
   *
   * @param revisionUuid The UUID of the revision to get
   * @returns The revision DTO
   * @throws NotInDBError if the revision with the given UUID does not exist
   */
  async getRevisionDto(revisionUuid: string): Promise<RevisionDto> {
    const revision = await this.knex(TableRevision)
      .select(
        FieldNameRevision.uuid,
        FieldNameRevision.createdAt,
        FieldNameRevision.description,
        FieldNameRevision.content,
        FieldNameRevision.title,
        FieldNameRevision.patch,
      )
      .where(FieldNameRevision.uuid, revisionUuid)
      .first();
    if (revision === undefined) {
      throw new NotInDBError(
        `Revision with ID ${revisionUuid} not found.`,
        this.logger.getContext(),
        'getRevision',
      );
    }
    return RevisionDto.create({
      uuid: revision[FieldNameRevision.uuid],
      content: revision[FieldNameRevision.content],
      length: (revision[FieldNameRevision.content] ?? '').length,
      createdAt: revision[FieldNameRevision.createdAt],
      title: revision[FieldNameRevision.title],
      description: revision[FieldNameRevision.description],
      patch: revision.patch,
    });
  }

  /**
   * Gets the latest revision of a note
   *
   * @param noteId The id of the note for which the latest revision should be retrieved
   * @param transaction The optional pre-existing database transaction to use
   */
  async getLatestRevision(
    noteId: number,
    transaction?: Knex,
  ): Promise<Revision> {
    const dbActor = transaction ?? this.knex;
    const revision = await dbActor(TableRevision)
      .select()
      .where(FieldNameRevision.noteId, noteId)
      .orderBy(FieldNameRevision.createdAt, 'desc')
      .first();
    if (revision === undefined) {
      throw new NotInDBError(
        'No revisions for note found',
        this.logger.getContext(),
        'getLatestRevision',
      );
    }
    return revision;
  }

  /**
   * Gets the user information of the authors of a revision
   *
   * @param revisionUuid The UUID of the revision for which the user information should be retrieved
   * @param transaction The optional pre-existing database transaction to use
   * @returns An object containing the usernames and guest UUIDs of the authors and the count of guest users
   */
  async getRevisionUserInfo(
    revisionUuid: string,
    transaction?: Knex,
  ): Promise<RevisionUserInfo> {
    const dbActor = transaction ?? this.knex;
    const authorUsernamesAndGuestUuids = await dbActor(TableAuthorshipInfo)
      .join(
        TableUser,
        `${TableAuthorshipInfo}.${FieldNameAuthorshipInfo.authorId}`,
        `${TableUser}.${FieldNameUser.id}`,
      )
      .select()
      .distinct<
        (Pick<User, FieldNameUser.username | FieldNameUser.guestUuid> &
          Pick<
            AuthorshipInfo,
            FieldNameAuthorshipInfo.authorId | FieldNameAuthorshipInfo.createdAt
          >)[]
      >(`${TableUser}.${FieldNameUser.username}`, `${TableUser}.${FieldNameUser.guestUuid}`, `${TableAuthorshipInfo}.${FieldNameAuthorshipInfo.createdAt}`, `${TableAuthorshipInfo}.${FieldNameAuthorshipInfo.authorId}`)
      .where(FieldNameAuthorshipInfo.revisionUuid, revisionUuid);
    const users: RevisionUserInfo['users'] = [];
    let guestUserCount = 0;
    for (const author of authorUsernamesAndGuestUuids) {
      if (author[FieldNameUser.guestUuid] !== null) {
        guestUserCount++;
      }
      if (author[FieldNameUser.username] !== null) {
        users.push({
          username: author[FieldNameUser.username],
          createdAt: author[FieldNameAuthorshipInfo.createdAt],
        });
      }
    }
    return {
      users,
      guestUserCount,
    };
  }

  /**
   * Creates a new revision for the given note
   * This method wraps the actual action in a database transaction
   *
   * @param noteId The note for which the revision should be created
   * @param newContent The new note content
   * @param firstRevision Whether this is called for the first revision of a note
   * @param transaction The optional pre-existing database transaction to use
   * @param yjsStateVector The yjs state vector that describes the new content
   * @returns the created revision or undefined if the revision couldn't be created
   */
  async createRevision(
    noteId: number,
    newContent: string,
    firstRevision: boolean = false,
    transaction?: Knex,
    yjsStateVector?: ArrayBuffer,
  ): Promise<void> {
    if (!transaction) {
      await this.knex.transaction(async (newTransaction) => {
        await this.innerCreateRevision(
          noteId,
          newContent,
          firstRevision,
          newTransaction,
          yjsStateVector,
        );
      });
      return;
    }
    await this.innerCreateRevision(
      noteId,
      newContent,
      firstRevision,
      transaction,
      yjsStateVector,
    );
  }

  /**
   * Internal method to create a revision for the given note
   * This method is used by the public createRevision method and should not be called directly
   *
   * @param noteId The note for which the revision should be created
   * @param newContent The new note content
   * @param firstRevision Whether this is called for the first revision of a note
   * @param transaction The database transaction to use
   * @param yjsStateVector The yjs state vector that describes the new content
   */
  private async innerCreateRevision(
    noteId: number,
    newContent: string,
    firstRevision: boolean,
    transaction: Knex,
    yjsStateVector?: ArrayBuffer,
  ): Promise<void> {
    const latestRevision = firstRevision
      ? null
      : await this.getLatestRevision(noteId, transaction);
    const oldContent = latestRevision?.content;
    if (oldContent === newContent) {
      return undefined;
    }
    const primaryAlias = await this.aliasService.getPrimaryAliasByNoteId(
      noteId,
      transaction,
    );
    const patch = createPatch(
      primaryAlias,
      latestRevision?.content ?? '',
      newContent,
    );

    const { title, description, tags, noteType } =
      extractRevisionMetadataFromContent(newContent);
    const revisionIds = await transaction(TableRevision).insert(
      {
        [FieldNameRevision.content]: newContent,
        [FieldNameRevision.description]: description,
        [FieldNameRevision.noteId]: noteId,
        [FieldNameRevision.noteType]: noteType,
        [FieldNameRevision.patch]: patch,
        [FieldNameRevision.title]: title,
        [FieldNameRevision.uuid]: uuidv7(),
        [FieldNameRevision.yjsStateVector]: yjsStateVector ?? null,
      },
      [FieldNameRevision.uuid],
    );
    if (revisionIds.length !== 1) {
      throw new GenericDBError(
        'Failed to insert revision',
        this.logger.getContext(),
        'createRevision',
      );
    }
    const revisionId = revisionIds[0][FieldNameRevision.uuid];
    if (tags.length > 0) {
      await transaction(TableRevisionTag).insert(
        tags.map((tag) => ({
          [FieldNameRevisionTag.tag]: tag,
          [FieldNameRevisionTag.revisionUuid]: revisionId,
        })),
      );
    }
  }

  /**
   * Get all tags of a revision
   *
   * @param revisionUuid The UUID of the revision for which the tags should be retrieved
   * @param transaction The optional pre-existing database transaction to use
   * @returns An array of tags associated with the revision
   */
  async getTagsByRevisionUuid(
    revisionUuid: string,
    transaction?: Knex,
  ): Promise<string[]> {
    const dbActor = transaction ?? this.knex;
    const tags = await dbActor(TableRevisionTag)
      .select(FieldNameRevisionTag.tag)
      .where(FieldNameRevisionTag.revisionUuid, revisionUuid);
    return tags.map((tag) => tag[FieldNameRevisionTag.tag]);
  }

  // Delete all old revisions everyday on 0:00 AM
  @Cron('0 0 * * *')
  async handleRevisionCleanup(): Promise<void> {
    return await this.removeOldRevisions();
  }

  // Delete all old revisions 90 sec after startup
  @Timeout(90 * 1000)
  async handleRevisionCleanupTimeout(): Promise<void> {
    return await this.removeOldRevisions();
  }

  /**
   * Deletes old revisions except the latest one if the clean-up is enabled
   */
  async removeOldRevisions(): Promise<void> {
    const currentTime = new Date().getTime();
    const revisionRetentionDays: number = this.noteConfig.revisionRetentionDays;
    if (revisionRetentionDays <= 0) {
      return;
    }
    const revisionRetentionMilliSeconds =
      revisionRetentionDays * 24 * 60 * 60 * 1000;

    await this.knex.transaction(async (transaction) => {
      // Delete old revisions
      const noteIdsWhereRevisionWereDeleted = await transaction(TableRevision)
        .where(
          FieldNameRevision.createdAt,
          '<=',
          currentTime - revisionRetentionMilliSeconds,
        )
        .delete(FieldNameRevision.noteId);

      this.logger.log(
        `${noteIdsWhereRevisionWereDeleted.length} old revisions were removed from the DB`,
        'removeOldRevisions',
      );

      if (noteIdsWhereRevisionWereDeleted.length === 0) {
        return;
      }

      const uniqueNoteIds = Array.from(
        new Set(
          noteIdsWhereRevisionWereDeleted.map(
            (entry) => entry[FieldNameRevision.noteId],
          ),
        ),
      );

      const revisionsToUpdate = await transaction(TableRevision)
        .join(
          TableAlias,
          `${TableAlias}.${FieldNameAlias.noteId}`,
          `${TableRevision}.${FieldNameRevision.noteId}`,
        )
        .select(
          FieldNameRevision.uuid,
          FieldNameRevision.noteId,
          FieldNameRevision.content,
          FieldNameAlias.alias,
        )
        .whereIn(FieldNameRevision.noteId, uniqueNoteIds)
        .andWhere(FieldNameAlias.isPrimary, true)
        .orderBy([
          { column: FieldNameRevision.noteId },
          { column: FieldNameRevision.createdAt, order: 'ASC' },
        ]);

      let lastNoteId = -1;
      let lastContent = '';

      for (const revisionToUpdate of revisionsToUpdate) {
        const id = revisionToUpdate[FieldNameRevision.uuid];
        const noteId = revisionToUpdate[FieldNameRevision.noteId];
        const primaryAlias = revisionToUpdate[FieldNameAlias.alias];
        const content = revisionToUpdate[FieldNameRevision.content];

        let newPatch = '';
        if (noteId !== lastNoteId) {
          newPatch = createPatch(
            primaryAlias,
            '', // There is no older Revision
            content,
          );
        } else {
          newPatch = createPatch(primaryAlias, lastContent, content);
        }

        await transaction(TableRevision)
          .update(FieldNameRevision.patch, newPatch)
          .where(FieldNameRevision.uuid, id);

        lastNoteId = noteId;
        lastContent = content;
      }
    });
  }
}
