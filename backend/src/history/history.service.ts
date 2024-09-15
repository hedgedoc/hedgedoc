/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { NotesService } from '../notes/notes.service';
import { RevisionsService } from '../revisions/revisions.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { HistoryEntryImportDto } from './history-entry-import.dto';
import { HistoryEntryUpdateDto } from './history-entry-update.dto';
import { HistoryEntryDto } from './history-entry.dto';
import { HistoryEntry } from './history-entry.entity';
import { getIdentifier } from './utils';

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
    private revisionsService: RevisionsService,
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
    return await this.historyEntryRepository
      .createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId: user.id })
      .getMany();
  }

  /**
   * @async
   * Get a history entry by the user and note
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @return {HistoryEntry} the requested history entry
   */
  async getEntryByNote(note: Note, user: User): Promise<HistoryEntry> {
    const entry = await this.historyEntryRepository
      .createQueryBuilder('entry')
      .where('entry.note = :note', { note: note.id })
      .andWhere('entry.user = :user', { user: user.id })
      .leftJoinAndSelect('entry.note', 'note')
      .leftJoinAndSelect('entry.user', 'user')
      .getOne();
    if (!entry) {
      throw new NotInDBError(
        `User '${user.username}' has no HistoryEntry for Note with id '${note.id}'`,
      );
    }
    return entry;
  }

  /**
   * @async
   * Updates the updatedAt timestamp of a HistoryEntry.
   * If no history entry exists, it will be created.
   * @param {Note} note - the note that the history entry belongs to
   * @param {User | null} user - the user that the history entry belongs to
   * @return {HistoryEntry} the requested history entry
   */
  async updateHistoryEntryTimestamp(
    note: Note,
    user: User | null,
  ): Promise<HistoryEntry | null> {
    if (user == null) {
      return null;
    }
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
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @param {HistoryEntryUpdateDto} updateDto - the change that should be applied to the history entry
   * @return {HistoryEntry} the requested history entry
   */
  async updateHistoryEntry(
    note: Note,
    user: User,
    updateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntry> {
    const entry = await this.getEntryByNote(note, user);
    entry.pinStatus = updateDto.pinStatus;
    return await this.historyEntryRepository.save(entry);
  }

  /**
   * @async
   * Delete the history entry identified by the user and a note id or alias
   * @param {Note} note - the note that the history entry belongs to
   * @param {User} user - the user that the history entry belongs to
   * @throws {NotInDBError} the specified history entry does not exist
   */
  async deleteHistoryEntry(note: Note, user: User): Promise<void> {
    const entry = await this.getEntryByNote(note, user);
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
      const currentHistory = await manager
        .createQueryBuilder(HistoryEntry, 'entry')
        .where('entry.userId = :userId', { userId: user.id })
        .getMany();
      for (const entry of currentHistory) {
        await manager.remove<HistoryEntry>(entry);
      }
      for (const historyEntry of history) {
        const note = await this.notesService.getNoteByIdOrAlias(
          historyEntry.note,
        );
        const entry = HistoryEntry.create(user, note) as HistoryEntry;
        entry.pinStatus = historyEntry.pinStatus;
        entry.updatedAt = historyEntry.lastVisitedAt;
        await manager.save<HistoryEntry>(entry);
      }
    });
  }

  /**
   * Build HistoryEntryDto from a history entry.
   * @param {HistoryEntry} entry - the history entry to use
   * @return {HistoryEntryDto} the built HistoryEntryDto
   */
  async toHistoryEntryDto(entry: HistoryEntry): Promise<HistoryEntryDto> {
    const note = await entry.note;
    const owner = await note.owner;
    const revision = await this.revisionsService.getLatestRevision(note);
    return {
      identifier: await getIdentifier(entry),
      lastVisitedAt: entry.updatedAt,
      tags: (await revision.tags).map((tag) => tag.name),
      title: revision.title ?? '',
      pinStatus: entry.pinStatus,
      owner: owner ? owner.username : null,
    };
  }
}
