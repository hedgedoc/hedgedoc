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
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  AlreadyInDBError,
  NotInDBError,
  PermissionsUpdateInconsistentError,
} from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { HistoryService } from '../../../history/history.service';
import { NoteDto } from '../../../notes/note.dto';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { PermissionsService } from '../../../permissions/permissions.service';
import { Note } from '../../../notes/note.entity';

@ApiTags('notes')
@ApiSecurity('token')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
    private permissionsService: PermissionsService,
    private historyService: HistoryService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  async createNote(
    @Req() req,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    // ToDo: provide user for createNoteDto
    if (!this.permissionsService.mayCreate(req.user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text);
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, undefined, req.user),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias')
  async getNote(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteDto> {
    let note: Note;
    try {
      note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
    if (!this.permissionsService.mayRead(req.user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.historyService.createOrUpdateHistoryEntry(note, req.user);
    return await this.noteService.toNoteDto(note);
  }

  @UseGuards(TokenAuthGuard)
  @Post(':noteAlias')
  async createNamedNote(
    @Req() req,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!this.permissionsService.mayCreate(req.user)) {
      throw new UnauthorizedException('Creating note denied!');
    }
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    try {
      return await this.noteService.toNoteDto(
        await this.noteService.createNote(text, noteAlias, req.user),
      );
    } catch (e) {
      if (e instanceof AlreadyInDBError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Delete(':noteIdOrAlias')
  async deleteNote(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<void> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.isOwner(req.user, note)) {
        throw new UnauthorizedException('Deleting note denied!');
      }
      this.logger.debug('Deleting note: ' + noteIdOrAlias, 'deleteNote');
      await this.noteService.deleteNote(note);
      this.logger.debug('Successfully deleted ' + noteIdOrAlias, 'deleteNote');
      return;
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias')
  async updateNote(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayWrite(req.user, note)) {
        throw new UnauthorizedException('Updating note denied!');
      }
      this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
      return await this.noteService.toNoteDto(
        await this.noteService.updateNote(note, text),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/content')
  @Header('content-type', 'text/markdown')
  async getNoteContent(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<string> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(req.user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      return await this.noteService.getNoteContent(note);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/metadata')
  async getNoteMetadata(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteMetadataDto> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(req.user, note)) {
        throw new UnauthorizedException('Reading note denied!');
      }
      return await this.noteService.toNoteMetadataDto(note);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      if (e instanceof PermissionsUpdateInconsistentError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias/metadata/permissions')
  async updateNotePermissions(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.isOwner(req.user, note)) {
        throw new UnauthorizedException('Updating note denied!');
      }
      return await this.noteService.toNotePermissionsDto(
        this.noteService.updateNotePermissions(note, updateDto),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/revisions')
  async getNoteRevisions(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<RevisionMetadataDto[]> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(req.user, note)) {
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
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  async getNoteRevision(
    @Req() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(req.user, note)) {
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
