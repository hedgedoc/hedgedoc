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
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HistoryEntryUpdateDto } from '../../../history/history-entry-update.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { NotesService } from '../../../notes/notes.service';
import { UsersService } from '../../../users/users.service';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { UserInfoDto } from '../../../users/user-info.dto';
import { NotInDBError } from '../../../errors/errors';

@ApiTags('me')
@ApiSecurity('token')
@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private historyService: HistoryService,
    private notesService: NotesService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Get()
  async getMe(@Request() req): Promise<UserInfoDto> {
    return this.usersService.toUserDto(
      await this.usersService.getUserByUsername(req.user.userName),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get('history')
  async getUserHistory(@Request() req): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(req.user);
    return Promise.all(
      foundEntries.map(
        async (entry) => await this.historyService.toHistoryEntryDto(entry),
      ),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Put('history/:note')
  async updateHistoryEntry(
    @Request() req,
    @Param('note') note: string,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    // ToDo: Check if user is allowed to pin this history entry
    try {
      return this.historyService.toHistoryEntryDto(
        await this.historyService.updateHistoryEntry(
          note,
          req.user,
          entryUpdateDto,
        ),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Delete('history/:note')
  @HttpCode(204)
  deleteHistoryEntry(@Request() req, @Param('note') note: string) {
    // ToDo: Check if user is allowed to delete note
    try {
      return this.historyService.deleteHistoryEntry(note, req.user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get('notes')
  async getMyNotes(@Request() req): Promise<NoteMetadataDto[]> {
    const notes = await this.notesService.getUserNotes(req.user);
    return Promise.all(
      notes.map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }
}
