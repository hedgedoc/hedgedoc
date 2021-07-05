/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HistoryEntryUpdateDto } from './history-entry-update.dto';
import { HistoryEntryDto } from './history-entry.dto';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { HistoryEntry } from './history-entry.entity';
import { UsersService } from '../users/users.service';
import { NotesService } from '../notes/notes.service';
import { User } from '../users/user.entity';
import { Note } from '../notes/note.entity';
import { NotInDBError } from '../errors/errors';
import { HistoryEntryImportDto } from './history-entry-import.dto';

@Injectable()
export class HistoryService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectConnection()
    private connection: Connection,
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
      relations: ['note', 'note.aliases', 'user'],
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
    const entry = await this.historyEntryRepository.findOne({
      where: {
        note: note,
        user: user,
      },
      relations: ['note', 'note.aliases', 'user'],
    });
    if (!entry) {
      throw new NotInDBError(
        `User '${user.userName}' has no HistoryEntry for Note with id '${note.id}'`,
      );
    }
    return entry;
  }

  /**
   * @async
   * Create or update a history entry by the user and note. If the entry is merely updated the updatedAt date is set to the current date.
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @return {HistoryEntry} the requested history entry
   */
  async createOrUpdateHistoryEntry(
    note: Note,
    user: User,
  ): Promise<HistoryEntry> {
    try {
      const entry = await this.getEntryByNote(note, user);
      entry.updatedAt = new Date();
      return await this.historyEntryRepository.save(entry);
    } catch (e) {
      if (e instanceof NotInDBError) {
        const entry = HistoryEntry.create(user, note);
        return await this.historyEntryRepository.save(entry);
      }
      throw e;
    }
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
   * @async
   * Replace the user history with the provided history
   * @param {User} user - the user that get's their history replaces
   * @param {HistoryEntryImportDto[]} history
   * @throws {ForbiddenIdError} one of the note ids or alias in the new history are forbidden
   */
  async setHistory(
    user: User,
    history: HistoryEntryImportDto[],
  ): Promise<void> {
    await this.connection.transaction(async (manager) => {
      const currentHistory = await manager.find<HistoryEntry>(HistoryEntry, {
        where: { user: user },
        relations: ['note', 'note.aliases', 'user'],
      });
      for (const entry of currentHistory) {
        await manager.remove<HistoryEntry>(entry);
      }
      for (const historyEntry of history) {
        this.notesService.checkNoteIdOrAlias(historyEntry.note);
        const note = await manager
          .createQueryBuilder<Note>(Note, 'note')
          .innerJoin('note.aliases', 'alias')
          .where('note.id = :id', { id: historyEntry.note })
          .orWhere('alias.name = :id', { id: historyEntry.note })
          .getOne();
        if (note === undefined) {
          this.logger.debug(
            `Could not find note '${historyEntry.note}'`,
            'setHistory',
          );
          throw new NotInDBError(
            `Note with id/alias '${historyEntry.note}' not found.`,
          );
        }
        const entry = HistoryEntry.create(user, note);
        entry.pinStatus = historyEntry.pinStatus;
        entry.updatedAt = historyEntry.lastVisited;
        await manager.save<HistoryEntry>(entry);
      }
    });
  }

  /**
   * Build HistoryEntryDto from a history entry.
   * @param {HistoryEntry} entry - the history entry to use
   * @return {HistoryEntryDto} the built HistoryEntryDto
   */
  toHistoryEntryDto(entry: HistoryEntry): HistoryEntryDto {
    return {
      identifier:
        !entry.note.aliases || entry.note.aliases.length === 0
          ? entry.note.publicId
          : entry.note.aliases.filter((alias) => alias.primary)[0].name,
      lastVisited: entry.updatedAt,
      tags: this.notesService.toTagList(entry.note),
      title: entry.note.title ?? '',
      pinStatus: entry.pinStatus,
    };
  }
}
