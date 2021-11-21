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
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
} from '../../../errors/errors';
import { HistoryService } from '../../../history/history.service';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { NoteDto } from '../../../notes/note.dto';
import { Note } from '../../../notes/note.entity';
import { NoteMediaDeletionDto } from '../../../notes/note.media-deletion.dto';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsService } from '../../../permissions/permissions.service';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { RevisionsService } from '../../../revisions/revisions.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { GetNotePipe } from '../../utils/get-note.pipe';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private permissionsService: PermissionsService,
    private historyService: HistoryService,
    private userService: UsersService,
    private mediaService: MediaService,
    private revisionsService: RevisionsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Get(':noteIdOrAlias')
  async getNote(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<NoteDto> {
    if (!this.permissionsService.mayRead(user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Get(':noteIdOrAlias/media')
  async getNotesMedia(
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @RequestUser() user: User,
  ): Promise<MediaUploadDto[]> {
    if (!this.permissionsService.mayRead(user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const media = await this.mediaService.listUploadsByNote(note);
    return media.map((media) => this.mediaService.toMediaUploadDto(media));
  }

  @Post()
  @HttpCode(201)
  async createNote(
    @RequestUser() user: User,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!this.permissionsService.mayCreate(user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text);
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user),
    );
  }

  @Post(':noteAlias')
  @HttpCode(201)
  async createNamedNote(
    @RequestUser() user: User,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!this.permissionsService.mayCreate(user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    try {
      return await this.noteService.toNoteDto(
        await this.noteService.createNote(text, user, noteAlias),
      );
    } catch (e) {
      if (e instanceof AlreadyInDBError) {
        throw new BadRequestException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Delete(':noteIdOrAlias')
  @HttpCode(204)
  async deleteNote(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    if (!this.permissionsService.isOwner(user, note)) {
      throw new UnauthorizedException('Deleting note denied!');
    }
    const mediaUploads = await this.mediaService.listUploadsByNote(note);
    for (const mediaUpload of mediaUploads) {
      if (!noteMediaDeletionDto.keepMedia) {
        await this.mediaService.deleteFile(mediaUpload);
      } else {
        await this.mediaService.removeNoteFromMediaUpload(mediaUpload);
      }
    }
    this.logger.debug('Deleting note: ' + note.id, 'deleteNote');
    await this.noteService.deleteNote(note);
    this.logger.debug('Successfully deleted ' + note.id, 'deleteNote');
    return;
  }

  @Get(':noteIdOrAlias/revisions')
  async getNoteRevisions(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<RevisionMetadataDto[]> {
    if (!this.permissionsService.mayRead(user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    const revisions = await this.revisionsService.getAllRevisions(note);
    return await Promise.all(
      revisions.map((revision) =>
        this.revisionsService.toRevisionMetadataDto(revision),
      ),
    );
  }

  @Delete(':noteIdOrAlias/revisions')
  @HttpCode(204)
  async purgeNoteRevisions(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<void> {
    if (!this.permissionsService.mayRead(user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    this.logger.debug(
      'Purging history of note: ' + note.id,
      'purgeNoteRevisions',
    );
    await this.revisionsService.purgeRevisions(note);
    this.logger.debug(
      'Successfully purged history of note ' + note.id,
      'purgeNoteRevisions',
    );
    return;
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  async getNoteRevision(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    try {
      if (!this.permissionsService.mayRead(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      return this.revisionsService.toRevisionDto(
        await this.revisionsService.getRevision(note, revisionId),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
