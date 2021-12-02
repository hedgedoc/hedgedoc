/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ForbiddenIdError, NotInDBError } from '../../../../errors/errors';
import { HistoryEntryImportDto } from '../../../../history/history-entry-import.dto';
import { HistoryEntryUpdateDto } from '../../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../../history/history-entry.dto';
import { HistoryService } from '../../../../history/history.service';
import { SessionGuard } from '../../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { Note } from '../../../../notes/note.entity';
import { User } from '../../../../users/user.entity';
import { GetNotePipe } from '../../../utils/get-note.pipe';
import { RequestUser } from '../../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@ApiTags('history')
@Controller('/me/history')
export class HistoryController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private historyService: HistoryService,
  ) {
    this.logger.setContext(HistoryController.name);
  }

  @Get()
  async getHistory(@RequestUser() user: User): Promise<HistoryEntryDto[]> {
    try {
      const foundEntries = await this.historyService.getEntriesByUser(user);
      return foundEntries.map((entry) =>
        this.historyService.toHistoryEntryDto(entry),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Post()
  async setHistory(
    @RequestUser() user: User,
    @Body('history') history: HistoryEntryImportDto[],
  ): Promise<void> {
    try {
      await this.historyService.setHistory(user, history);
    } catch (e) {
      if (e instanceof NotInDBError || e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Delete()
  async deleteHistory(@RequestUser() user: User): Promise<void> {
    try {
      await this.historyService.deleteHistory(user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Put(':note')
  async updateHistoryEntry(
    @Param('note', GetNotePipe) note: Note,
    @RequestUser() user: User,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    try {
      const newEntry = await this.historyService.updateHistoryEntry(
        note,
        user,
        entryUpdateDto,
      );
      return this.historyService.toHistoryEntryDto(newEntry);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Delete(':note')
  async deleteHistoryEntry(
    @Param('note', GetNotePipe) note: Note,
    @RequestUser() user: User,
  ): Promise<void> {
    try {
      await this.historyService.deleteHistoryEntry(note, user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
