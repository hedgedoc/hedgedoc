/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../../auth/session.guard';
import { User } from '../../../../database/user.entity';
import { HistoryEntryImportListDto } from '../../../../history/history-entry-import.dto';
import { HistoryEntryUpdateDto } from '../../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../../history/history-entry.dto';
import { HistoryService } from '../../../../history/history.service';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { Note } from '../../../../notes/note.entity';
import { GetNoteIdInterceptor } from '../../../utils/get-note-id.interceptor';
import { OpenApi } from '../../../utils/openapi.decorator';
import { RequestNoteId } from '../../../utils/request-note-id.decorator';
import { RequestUserId } from '../../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
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
  @OpenApi(200, 404)
  async getHistory(@RequestUserId() user: User): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(user);
    return await Promise.all(
      foundEntries.map((entry) => this.historyService.toHistoryEntryDto(entry)),
    );
  }

  @Post()
  @OpenApi(201, 404)
  async setHistory(
    @RequestUserId() user: User,
    @Body() historyImport: HistoryEntryImportListDto,
  ): Promise<void> {
    await this.historyService.setHistory(user, historyImport.history);
  }

  @Delete()
  @OpenApi(204, 404)
  async deleteHistory(@RequestUserId() user: User): Promise<void> {
    await this.historyService.deleteHistory(user);
  }

  @Put(':noteAlias')
  @OpenApi(200, 404)
  @UseInterceptors(GetNoteIdInterceptor)
  async updateHistoryEntry(
    @RequestNoteId() note: Note,
    @RequestUserId() user: User,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    const newEntry = await this.historyService.updateHistoryEntry(
      note,
      user,
      entryUpdateDto,
    );
    return await this.historyService.toHistoryEntryDto(newEntry);
  }

  @Delete(':noteAlias')
  @OpenApi(204, 404)
  @UseInterceptors(GetNoteIdInterceptor)
  async deleteHistoryEntry(
    @RequestNoteId() note: Note,
    @RequestUserId() user: User,
  ): Promise<void> {
    await this.historyService.deleteHistoryEntry(note, user);
  }
}
