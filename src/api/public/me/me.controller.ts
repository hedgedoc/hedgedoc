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
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { NotesService } from '../../../notes/notes.service';
import { UserInfoDto } from '../../../users/user-info.dto';
import { UsersService } from '../../../users/users.service';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';
import { ApiSecurity } from '@nestjs/swagger';

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
  getUserHistory(@Request() req): HistoryEntryDto[] {
    return this.historyService.getUserHistory(req.user.userName);
  }

  @UseGuards(TokenAuthGuard)
  @Put('history/:note')
  updateHistoryEntry(
    @Request() req,
    @Param('note') note: string,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): HistoryEntryDto {
    // ToDo: Check if user is allowed to pin this history entry
    return this.historyService.updateHistoryEntry(note, entryUpdateDto);
  }

  @UseGuards(TokenAuthGuard)
  @Delete('history/:note')
  @HttpCode(204)
  deleteHistoryEntry(@Request() req, @Param('note') note: string) {
    // ToDo: Check if user is allowed to delete note
    try {
      return this.historyService.deleteHistoryEntry(note);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get('notes')
  getMyNotes(@Request() req): NoteMetadataDto[] {
    return this.notesService.getUserNotes(req.user.userName);
  }
}
