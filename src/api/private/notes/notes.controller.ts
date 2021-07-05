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
  Put,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Note } from '../../../notes/note.entity';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
} from '../../../errors/errors';
import { NoteDto } from '../../../notes/note.dto';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsService } from '../../../permissions/permissions.service';
import { HistoryService } from '../../../history/history.service';
import { UsersService } from '../../../users/users.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { RevisionsService } from '../../../revisions/revisions.service';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { NoteMediaDeletionDto } from '../../../notes/note.media-deletion.dto';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { Request } from 'express';

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
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteDto> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    let note: Note;
    try {
      note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
    if (!this.permissionsService.mayRead(user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.historyService.createOrUpdateHistoryEntry(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Get(':noteIdOrAlias/media')
  async getNotesMedia(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<MediaUploadDto[]> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const media = await this.mediaService.listUploadsByNote(note);
      return media.map((media) => this.mediaService.toMediaUploadDto(media));
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @Post()
  @HttpCode(201)
  async createNote(@MarkdownBody() text: string): Promise<NoteDto> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    // ToDo: provide user for createNoteDto
    if (!this.permissionsService.mayCreate(user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text);
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, undefined, user),
    );
  }

  @Post(':noteAlias')
  @HttpCode(201)
  async createNamedNote(
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    // ToDo: use actual user here
    const user = await this.userService.getUserByUsername('hardcoded');
    if (!this.permissionsService.mayCreate(user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    try {
      return await this.noteService.toNoteDto(
        await this.noteService.createNote(text, noteAlias, user),
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
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
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
      this.logger.debug('Deleting note: ' + noteIdOrAlias, 'deleteNote');
      await this.noteService.deleteNote(note);
      this.logger.debug('Successfully deleted ' + noteIdOrAlias, 'deleteNote');
      return;
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Post(':noteIdOrAlias/metadata/alias/:newAlias')
  async addAlias(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('newAlias') newAlias: string,
  ): Promise<NoteMetadataDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.isOwner(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const updatedNote = await this.noteService.addAlias(note, newAlias);
      return await this.noteService.toNoteMetadataDto(updatedNote);
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

  @Put(':alias/metadata/alias')
  async makeAliasPrimary(
    @Req() req: Request,
    @Param('alias') alias: string,
  ): Promise<NoteMetadataDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!this.permissionsService.isOwner(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const updatedNote = await this.noteService.makeAliasPrimary(note, alias);
      return await this.noteService.toNoteMetadataDto(updatedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Delete(':alias/metadata/alias')
  async removeAlias(
    @Req() req: Request,
    @Param('alias') alias: string,
  ): Promise<NoteMetadataDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(alias);
      if (!this.permissionsService.isOwner(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const updatedNote = await this.noteService.removeAlias(note, alias);
      return await this.noteService.toNoteMetadataDto(updatedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/revisions')
  async getNoteRevisions(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<RevisionMetadataDto[]> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      const revisions = await this.revisionsService.getAllRevisions(note);
      return await Promise.all(
        revisions.map((revision) =>
          this.revisionsService.toRevisionMetadataDto(revision),
        ),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  async getNoteRevision(
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    try {
      // ToDo: use actual user here
      const user = await this.userService.getUserByUsername('hardcoded');
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }
}
