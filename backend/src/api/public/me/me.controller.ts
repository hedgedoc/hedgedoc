/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FullUserInfoDto,
  FullUserInfoSchema,
  MediaUploadDto,
  MediaUploadSchema,
  NoteMetadataDto,
  NoteMetadataSchema,
} from '@hedgedoc/commons';
import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { HistoryEntryUpdateDto } from '../../../history/history-entry-update.dto';
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { GetNoteInterceptor } from '../../utils/get-note.interceptor';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestNote } from '../../utils/request-note.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
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

  @Get()
  @OpenApi({
    code: 200,
    description: 'The user information',
    schema: FullUserInfoSchema,
  })
  getMe(@RequestUser() user: User): FullUserInfoDto {
    return this.usersService.toFullUserDto(user);
  }

  @Get('history')
  @OpenApi({
    code: 200,
    description: 'The history entries of the user',
    isArray: true,
  })
  async getUserHistory(@RequestUser() user: User): Promise<HistoryEntryDto[]> {
    const foundEntries = await this.historyService.getEntriesByUser(user);
    return await Promise.all(
      foundEntries.map((entry) => this.historyService.toHistoryEntryDto(entry)),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @Get('history/:noteIdOrAlias')
  @OpenApi(
    {
      code: 200,
      description: 'The history entry of the user which points to the note',
    },
    404,
  )
  async getHistoryEntry(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<HistoryEntryDto> {
    const foundEntry = await this.historyService.getEntryByNote(note, user);
    return await this.historyService.toHistoryEntryDto(foundEntry);
  }

  @UseInterceptors(GetNoteInterceptor)
  @Put('history/:noteIdOrAlias')
  @OpenApi(
    {
      code: 200,
      description: 'The updated history entry',
    },
    404,
  )
  async updateHistoryEntry(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    return await this.historyService.toHistoryEntryDto(
      await this.historyService.updateHistoryEntry(note, user, entryUpdateDto),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @Delete('history/:noteIdOrAlias')
  @OpenApi(204, 404)
  async deleteHistoryEntry(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<void> {
    await this.historyService.deleteHistoryEntry(note, user);
  }

  @Get('notes')
  @OpenApi({
    code: 200,
    description: 'Metadata of all notes of the user',
    isArray: true,
    schema: NoteMetadataSchema,
  })
  async getMyNotes(@RequestUser() user: User): Promise<NoteMetadataDto[]> {
    const notes = this.notesService.getUserNotes(user);
    return await Promise.all(
      (await notes).map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }

  @Get('media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the user',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getMyMedia(@RequestUser() user: User): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByUser(user);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }
}
