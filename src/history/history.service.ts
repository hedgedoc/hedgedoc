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

  async getEntriesByUser(user: User): Promise<HistoryEntry[]> {
    return await this.historyEntryRepository.find({
      where: { user: user },
      relations: ['note'],
    });
  }

  private async getEntryByNoteIdOrAlias(
    noteIdOrAlias: string,
    user: User,
  ): Promise<HistoryEntry> {
    const note = await this.notesService.getNoteByIdOrAlias(noteIdOrAlias);
    return await this.getEntryByNote(note, user);
  }

  private async getEntryByNote(note: Note, user: User): Promise<HistoryEntry> {
    return await this.historyEntryRepository.findOne({
      where: {
        note: note,
        user: user,
      },
      relations: ['note', 'user'],
    });
  }

  async createOrUpdateHistoryEntry(
    note: Note,
    user: User,
  ): Promise<HistoryEntry> {
    let entry = await this.getEntryByNote(note, user);
    if (!entry) {
      entry = HistoryEntry.create(user, note);
    } else {
      entry.updatedAt = new Date();
    }
    return await this.historyEntryRepository.save(entry);
  }

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
    return this.historyEntryRepository.save(entry);
  }

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

  async toHistoryEntryDto(entry: HistoryEntry): Promise<HistoryEntryDto> {
    return {
      identifier: entry.note.alias ? entry.note.alias : entry.note.id,
      lastVisited: entry.updatedAt,
      tags: this.notesService.toTagList(entry.note),
      title: entry.note.title,
      pinStatus: entry.pinStatus,
    };
  }
}
