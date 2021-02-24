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
  Req,
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
import { Request } from 'express';

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
  async getMe(@Req() req: Request): Promise<UserInfoDto> {
    return this.usersService.toUserDto(
      await this.usersService.getUserByUsername(req.user.userName),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get('history')
  async getUserHistory(@Req() req: Request): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(req.user);
    return await Promise.all(
      foundEntries.map((entry) => this.historyService.toHistoryEntryDto(entry)),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Put('history/:note')
  async updateHistoryEntry(
    @Req() req: Request,
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
  deleteHistoryEntry(@Req() req: Request, @Param('note') note: string) {
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
  async getMyNotes(@Req() req: Request): Promise<NoteMetadataDto[]> {
    const notes = this.notesService.getUserNotes(req.user);
    return await Promise.all(
      (await notes).map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }
}
