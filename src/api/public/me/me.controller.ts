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
  InternalServerErrorException,
} from '@nestjs/common';
import { HistoryEntryUpdateDto } from '../../../history/history-entry-update.dto';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { NotesService } from '../../../notes/notes.service';
import { UsersService } from '../../../users/users.service';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HistoryEntryDto } from '../../../history/history-entry.dto';
import { UserInfoDto } from '../../../users/user-info.dto';
import { NotInDBError } from '../../../errors/errors';
import { Request } from 'express';
import { MediaService } from '../../../media/media.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import {
  notFoundDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';

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
  async getMe(@Req() req: Request): Promise<UserInfoDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    return this.usersService.toUserDto(
      await this.usersService.getUserByUsername(req.user.userName),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get('history')
  @ApiOkResponse({
    description: 'The history entries of the user',
    isArray: true,
    type: HistoryEntryDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getUserHistory(@Req() req: Request): Promise<HistoryEntryDto[]> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    const foundEntries = await this.historyService.getEntriesByUser(req.user);
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
    @Req() req: Request,
    @Param('note') note: string,
  ): Promise<HistoryEntryDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    try {
      const foundEntry = await this.historyService.getEntryByNoteIdOrAlias(
        note,
        req.user,
      );
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
    @Req() req: Request,
    @Param('note') note: string,
    @Body() entryUpdateDto: HistoryEntryUpdateDto,
  ): Promise<HistoryEntryDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async deleteHistoryEntry(
    @Req() req: Request,
    @Param('note') note: string,
  ): Promise<void> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    // ToDo: Check if user is allowed to delete note
    try {
      await this.historyService.deleteHistoryEntry(note, req.user);
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
  async getMyNotes(@Req() req: Request): Promise<NoteMetadataDto[]> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    const notes = this.notesService.getUserNotes(req.user);
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
  async getMyMedia(@Req() req: Request): Promise<MediaUploadDto[]> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    const media = await this.mediaService.listUploadsByUser(req.user);
    return media.map((media) => this.mediaService.toMediaUploadDto(media));
  }
}
