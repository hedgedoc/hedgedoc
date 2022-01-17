/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ErrorExceptionMapping } from '../../../../errors/error-mapping';
import { HistoryEntryImportDto } from '../../../../history/history-entry-import.dto';
import { HistoryEntryUpdateDto } from '../../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../../history/history-entry.dto';
import { HistoryService } from '../../../../history/history.service';
import { SessionGuard } from '../../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { Note } from '../../../../notes/note.entity';
import { User } from '../../../../users/user.entity';
import {
  notFoundDescription,
  unauthorizedDescription,
} from '../../../utils/descriptions';
import { GetNoteInterceptor } from '../../../utils/get-note.interceptor';
import { RequestNote } from '../../../utils/request-note.decorator';
import { RequestUser } from '../../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@UseFilters(ErrorExceptionMapping)
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
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getHistory(@RequestUser() user: User): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(user);
    return await Promise.all(
      foundEntries.map((entry) => this.historyService.toHistoryEntryDto(entry)),
    );
  }

  @Post()
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async setHistory(
    @RequestUser() user: User,
    @Body('history') history: HistoryEntryImportDto[],
  ): Promise<void> {
    await this.historyService.setHistory(user, history);
  }

  @Delete()
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async deleteHistory(@RequestUser() user: User): Promise<void> {
    await this.historyService.deleteHistory(user);
  }

  @Put(':noteIdOrAlias')
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  @UseInterceptors(GetNoteInterceptor)
  async updateHistoryEntry(
    @RequestNote() note: Note,
    @RequestUser() user: User,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    const newEntry = await this.historyService.updateHistoryEntry(
      note,
      user,
      entryUpdateDto,
    );
    return await this.historyService.toHistoryEntryDto(newEntry);
  }

  @Delete(':noteIdOrAlias')
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  @UseInterceptors(GetNoteInterceptor)
  async deleteHistoryEntry(
    @RequestNote() note: Note,
    @RequestUser() user: User,
  ): Promise<void> {
    await this.historyService.deleteHistoryEntry(note, user);
  }
}
