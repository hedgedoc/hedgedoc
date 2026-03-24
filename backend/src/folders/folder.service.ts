/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FieldNameFolder,
  FieldNameNote,
  Folder,
  TableFolder,
  TableNote,
} from '@hedgedoc/database';
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { GenericDBError, NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { dateTimeToDB, dateTimeToISOString, dbToDateTime, getCurrentDateTime } from '../utils/datetime';

@Injectable()
export class FolderService {
  constructor(
    @InjectConnection()
    private readonly knex: Knex,
    private readonly logger: ConsoleLoggerService,
  ) {
    this.logger.setContext(FolderService.name);
  }

  /**
   * Creates a new folder
   */
  async createFolder(
    name: string,
    ownerId: number,
    parentFolderId?: number | null,
  ): Promise<number> {
    if (parentFolderId) {
      await this.ensureFolderOwnedByUser(parentFolderId, ownerId);
    }

    const createdAt = dateTimeToDB(getCurrentDateTime());
    const result: Pick<Folder, FieldNameFolder.id>[] | number[] = await this.knex(TableFolder)
      .insert({
        [FieldNameFolder.name]: name,
        [FieldNameFolder.ownerId]: ownerId,
        [FieldNameFolder.parentFolderId]: parentFolderId ?? null,
        [FieldNameFolder.createdAt]: createdAt,
      }, [FieldNameFolder.id]);

    if (result.length !== 1) {
      throw new GenericDBError(
        'The folder could not be created in the database',
        this.logger.getContext(),
        'createFolder',
      );
    }

    const folderId = typeof result[0] === 'number' ? result[0] : result[0][FieldNameFolder.id];
    this.logger.debug(`Created folder '${name}' (id: ${folderId}) for user ${ownerId}`);
    return folderId;
  }

  /**
   * Gets all folders for a user, optionally filtered by parent
   */
  async getFoldersByUser(
    ownerId: number,
    parentFolderId?: number | null,
  ): Promise<Folder[]> {
    const query = this.knex(TableFolder)
      .select('*')
      .where(FieldNameFolder.ownerId, ownerId);

    if (parentFolderId !== undefined) {
      if (parentFolderId === null) {
        query.whereNull(FieldNameFolder.parentFolderId);
      } else {
        query.where(FieldNameFolder.parentFolderId, parentFolderId);
      }
    }

    query.orderBy(FieldNameFolder.name, 'asc');
    return await query;
  }

  /**
   * Gets a folder by its ID
   */
  async getFolderById(folderId: number): Promise<Folder> {
    const folder = await this.knex(TableFolder)
      .select('*')
      .where(FieldNameFolder.id, folderId)
      .first();

    if (!folder) {
      throw new NotInDBError(`Folder with id '${folderId}' not found`);
    }
    return folder;
  }

  /**
   * Updates a folder's name and/or parent
   */
  async updateFolder(
    folderId: number,
    ownerId: number,
    name?: string,
    parentFolderId?: number | null,
  ): Promise<Folder> {
    await this.ensureFolderOwnedByUser(folderId, ownerId);

    if (parentFolderId !== undefined && parentFolderId !== null) {
      // Prevent moving a folder into itself or its descendant
      if (parentFolderId === folderId) {
        throw new GenericDBError(
          'A folder cannot be its own parent',
          this.logger.getContext(),
          'updateFolder',
        );
      }
      await this.ensureFolderOwnedByUser(parentFolderId, ownerId);
      await this.ensureNoCircularReference(folderId, parentFolderId);
    }

    const updates: Partial<Folder> = {};
    if (name !== undefined) {
      updates[FieldNameFolder.name] = name;
    }
    if (parentFolderId !== undefined) {
      updates[FieldNameFolder.parentFolderId] = parentFolderId;
    }

    if (Object.keys(updates).length > 0) {
      await this.knex(TableFolder)
        .where(FieldNameFolder.id, folderId)
        .update(updates);
    }

    return await this.getFolderById(folderId);
  }

  /**
   * Deletes a folder. Notes inside are moved to root (folder_id = null).
   */
  async deleteFolder(folderId: number, ownerId: number): Promise<void> {
    await this.ensureFolderOwnedByUser(folderId, ownerId);

    // Move notes in this folder to root
    await this.knex(TableNote)
      .where(FieldNameNote.folderId, folderId)
      .update({ [FieldNameNote.folderId]: null });

    // Move sub-folders to parent of the deleted folder
    const folder = await this.getFolderById(folderId);
    await this.knex(TableFolder)
      .where(FieldNameFolder.parentFolderId, folderId)
      .update({ [FieldNameFolder.parentFolderId]: folder[FieldNameFolder.parentFolderId] });

    const deleted = await this.knex(TableFolder)
      .where(FieldNameFolder.id, folderId)
      .delete();

    if (deleted === 0) {
      throw new NotInDBError(`Folder with id '${folderId}' not found`);
    }
    this.logger.debug(`Deleted folder ${folderId}`);
  }

  /**
   * Moves a note into a folder (or to root if folderId is null)
   */
  async moveNoteToFolder(
    noteId: number,
    folderId: number | null,
    ownerId: number,
  ): Promise<void> {
    if (folderId !== null) {
      await this.ensureFolderOwnedByUser(folderId, ownerId);
    }
    const updated = await this.knex(TableNote)
      .where(FieldNameNote.id, noteId)
      .where(FieldNameNote.ownerId, ownerId)
      .update({ [FieldNameNote.folderId]: folderId });
    if (updated === 0) {
      throw new NotInDBError(`Note with id '${noteId}' not found`);
    }
  }

  /**
   * Converts a folder row to a DTO-style object
   */
  toFolderDto(folder: Folder) {
    return {
      id: folder[FieldNameFolder.id],
      name: folder[FieldNameFolder.name],
      ownerId: folder[FieldNameFolder.ownerId],
      parentFolderId: folder[FieldNameFolder.parentFolderId],
      createdAt: dateTimeToISOString(dbToDateTime(folder[FieldNameFolder.createdAt])),
    };
  }

  // -------- helpers --------

  async ensureFolderOwnedByUser(folderId: number, ownerId: number): Promise<void> {
    const folder = await this.getFolderById(folderId);
    if (folder[FieldNameFolder.ownerId] !== ownerId) {
      throw new NotInDBError(`Folder with id '${folderId}' not found`);
    }
  }

  private async ensureNoCircularReference(folderId: number, newParentId: number): Promise<void> {
    let currentId: number | null = newParentId;
    const visited = new Set<number>();
    while (currentId !== null) {
      if (currentId === folderId) {
        throw new GenericDBError(
          'Moving this folder would create a circular reference',
          this.logger.getContext(),
          'ensureNoCircularReference',
        );
      }
      if (visited.has(currentId)) break;
      visited.add(currentId);
      const parentRow: Pick<Folder, FieldNameFolder.parentFolderId> | undefined = await this.knex(
        TableFolder,
      )
        .select(FieldNameFolder.parentFolderId)
        .where(FieldNameFolder.id, currentId)
        .first();
      currentId = parentRow ? parentRow[FieldNameFolder.parentFolderId] : null;
    }
  }
}
