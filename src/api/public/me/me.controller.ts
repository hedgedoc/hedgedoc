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
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TokenAuthGuard } from '../../../auth/token.strategy';
import { NotInDBError } from '../../../errors/errors';
import { HistoryEntryUpdateDto } from '../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { UserInfoDto } from '../../../users/user-info.dto';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import {
  notFoundDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { GetNotePipe } from '../../utils/get-note.pipe';
import { RequestUser } from '../../utils/request-user.decorator';

@ApiTags('me')
@ApiSecurity('token')
@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private historyService: HistoryService,
    private notesService: NotesService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Get()
  @ApiOkResponse({
    description: 'The user information',
    type: UserInfoDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  getMe(@RequestUser() user: User): UserInfoDto {
    return this.usersService.toUserDto(user);
  }

  @UseGuards(TokenAuthGuard)
  @Get('history')
  @ApiOkResponse({
    description: 'The history entries of the user',
    isArray: true,
    type: HistoryEntryDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getUserHistory(@RequestUser() user: User): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(user);
    return await Promise.all(
      foundEntries.map((entry) => this.historyService.toHistoryEntryDto(entry)),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get('history/:note')
  @ApiOkResponse({
    description: 'The history entry of the user which points to the note',
    type: HistoryEntryDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getHistoryEntry(
    @RequestUser() user: User,
    @Param('note', GetNotePipe) note: Note,
  ): Promise<HistoryEntryDto> {
    try {
      const foundEntry = await this.historyService.getEntryByNote(note, user);
      return this.historyService.toHistoryEntryDto(foundEntry);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Put('history/:note')
  @ApiOkResponse({
    description: 'The updated history entry',
    type: HistoryEntryDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async updateHistoryEntry(
    @RequestUser() user: User,
    @Param('note', GetNotePipe) note: Note,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    // ToDo: Check if user is allowed to pin this history entry
    try {
      return this.historyService.toHistoryEntryDto(
        await this.historyService.updateHistoryEntry(
          note,
          user,
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
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async deleteHistoryEntry(
    @RequestUser() user: User,
    @Param('note', GetNotePipe) note: Note,
  ): Promise<void> {
    // ToDo: Check if user is allowed to delete note
    try {
      await this.historyService.deleteHistoryEntry(note, user);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get('notes')
  @ApiOkResponse({
    description: 'Metadata of all notes of the user',
    isArray: true,
    type: NoteMetadataDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getMyNotes(@RequestUser() user: User): Promise<NoteMetadataDto[]> {
    const notes = this.notesService.getUserNotes(user);
    return await Promise.all(
      (await notes).map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get('media')
  @ApiOkResponse({
    description: 'All media uploads of the user',
    isArray: true,
    type: MediaUploadDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getMyMedia(@RequestUser() user: User): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByUser(user);
    return media.map((media) => this.mediaService.toMediaUploadDto(media));
  }
}
