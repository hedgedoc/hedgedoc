/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HistoryEntryUpdateDto } from './history-entry-update.dto';
import { HistoryEntryDto } from './history-entry.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntry } from './history-entry.entity';
import { UsersService } from '../users/users.service';
import { NotesService } from '../notes/notes.service';
import { User } from '../users/user.entity';
import { Note } from '../notes/note.entity';
import { NotInDBError } from '../errors/errors';

@Injectable()
export class HistoryService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(HistoryEntry)
    private historyEntryRepository: Repository<HistoryEntry>,
    private usersService: UsersService,
    private notesService: NotesService,
  ) {
    this.logger.setContext(HistoryService.name);
  }

  /**
   * @async
   * Get all entries of a user
   * @param {User} user - the user the entries should be from
   * @return {HistoryEntry[]} an array of history entries of the specified user
   */
  async getEntriesByUser(user: User): Promise<HistoryEntry[]> {
    return await this.historyEntryRepository.find({
      where: { user: user },
      relations: ['note', 'user'],
    });
  }

  /**
   * @async
   * Get a history entry by the user and note, which is specified via id or alias
   * @param {string} noteIdOrAlias - the id or alias specifying the note
   * @param {User} user - the user that the note belongs to
   * @throws {NotInDBError} the specified note does not exist
   * @return {HistoryEntry} the requested history entry
   */
  async getEntryByNoteIdOrAlias(
    noteIdOrAlias: string,
    user: User,
  ): Promise<HistoryEntry> {
    const note = await this.notesService.getNoteByIdOrAlias(noteIdOrAlias);
    return await this.getEntryByNote(note, user);
  }

  /**
   * @async
   * Get a history entry by the user and note
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @return {HistoryEntry} the requested history entry
   */
  private async getEntryByNote(note: Note, user: User): Promise<HistoryEntry> {
    return await this.historyEntryRepository.findOne({
      where: {
        note: note,
        user: user,
      },
      relations: ['note', 'user'],
    });
  }

  /**
   * @async
   * Create or update a history entry by the user and note. If the entry is merely updated the updatedAt date is set to the current date.
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @param {boolean} pinStatus - if the pinStatus of the history entry should be set
   * @param {Date} lastVisited - the last time the associated note was accessed
   * @return {HistoryEntry} the requested history entry
   */
  async createOrUpdateHistoryEntry(
    note: Note,
    user: User,
    pinStatus?: boolean,
    lastVisited?: Date,
  ): Promise<HistoryEntry> {
    let entry = await this.getEntryByNote(note, user);
    if (!entry) {
      entry = HistoryEntry.create(user, note);
      if (pinStatus !== undefined) {
        entry.pinStatus = pinStatus;
      }
      if (lastVisited !== undefined) {
        entry.updatedAt = lastVisited;
      }
    } else {
      entry.updatedAt = new Date();
    }
    return await this.historyEntryRepository.save(entry);
  }

  /**
   * @async
   * Update a history entry identified by the user and a note id or alias
   * @param {string} noteIdOrAlias - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @param {HistoryEntryUpdateDto} updateDto - the change that should be applied to the history entry
   * @return {HistoryEntry} the requested history entry
   */
  async updateHistoryEntry(
    noteIdOrAlias: string,
    user: User,
    updateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntry> {
    const entry = await this.getEntryByNoteIdOrAlias(noteIdOrAlias, user);
    if (!entry) {
      throw new NotInDBError(
        `User '${user.userName}' has no HistoryEntry for Note with id '${noteIdOrAlias}'`,
      );
    }
    entry.pinStatus = updateDto.pinStatus;
    return await this.historyEntryRepository.save(entry);
  }

  /**
   * @async
   * Delete the history entry identified by the user and a note id or alias
   * @param {string} noteIdOrAlias - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @throws {NotInDBError} the specified history entry does not exist
   */
  async deleteHistoryEntry(noteIdOrAlias: string, user: User): Promise<void> {
    const entry = await this.getEntryByNoteIdOrAlias(noteIdOrAlias, user);
    if (!entry) {
      throw new NotInDBError(
        `User '${user.userName}' has no HistoryEntry for Note with id '${noteIdOrAlias}'`,
      );
    }
    await this.historyEntryRepository.remove(entry);
    return;
  }

  /**
   * @async
   * Delete all history entries of a specific user
   * @param {User} user - the user that the entry belongs to
   */
  async deleteHistory(user: User): Promise<void> {
    const entries: HistoryEntry[] = await this.getEntriesByUser(user);
    for (const entry of entries) {
      await this.historyEntryRepository.remove(entry);
    }
  }

  /**
   * Build HistoryEntryDto from a history entry.
   * @param {HistoryEntry} entry - the history entry to use
   * @return {HistoryEntryDto} the built HistoryEntryDto
   */
  toHistoryEntryDto(entry: HistoryEntry): HistoryEntryDto {
    return {
      identifier: entry.note.alias ? entry.note.alias : entry.note.id,
      lastVisited: entry.updatedAt,
      tags: this.notesService.toTagList(entry.note),
      title: entry.note.title ?? '',
      pinStatus: entry.pinStatus,
    };
  }
}
