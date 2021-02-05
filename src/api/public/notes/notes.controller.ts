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
  Header,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotInDBError } from '../../../errors/errors';
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

@ApiTags('notes')
@ApiSecurity('token')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
    private historyService: HistoryService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  async createNote(
    @Request() req,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    // ToDo: provide user for createNoteDto
    this.logger.debug('Got raw markdown:\n' + text, 'createNote');
    return this.noteService.toNoteDto(
      await this.noteService.createNote(text, undefined, req.user),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias')
  async getNote(@Request() req, @Param('noteIdOrAlias') noteIdOrAlias: string) {
    // ToDo: check if user is allowed to view this note
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      await this.historyService.createOrUpdateHistoryEntry(note, req.user);
      return this.noteService.toNoteDto(note);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Post(':noteAlias')
  async createNamedNote(
    @Request() req,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    // ToDo: check if user is allowed to view this note
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    return this.noteService.toNoteDto(
      await this.noteService.createNote(text, noteAlias, req.user),
    );
  }

  @UseGuards(TokenAuthGuard)
  @Delete(':noteIdOrAlias')
  async deleteNote(
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<void> {
    // ToDo: check if user is allowed to delete this note
    this.logger.debug('Deleting note: ' + noteIdOrAlias, 'deleteNote');
    try {
      await this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
    this.logger.debug('Successfully deleted ' + noteIdOrAlias, 'deleteNote');
    return;
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias')
  async updateNote(
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    // ToDo: check if user is allowed to change this note
    this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
    try {
      return this.noteService.toNoteDto(
        await this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, text),
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
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<string> {
    // ToDo: check if user is allowed to view this notes content
    try {
      return await this.noteService.getNoteContent(noteIdOrAlias);
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
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteMetadataDto> {
    // ToDo: check if user is allowed to view this notes metadata
    try {
      return this.noteService.toNoteMetadataDto(
        await this.noteService.getNoteByIdOrAlias(noteIdOrAlias),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias/metadata/permissions')
  async updateNotePermissions(
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    // ToDo: check if user is allowed to view this notes permissions
    try {
      return this.noteService.toNotePermissionsDto(
        await this.noteService.updateNotePermissions(noteIdOrAlias, updateDto),
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
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<RevisionMetadataDto[]> {
    // ToDo: check if user is allowed to view this notes revisions
    try {
      const revisions = await this.revisionsService.getAllRevisions(
        noteIdOrAlias,
      );
      return Promise.all(
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
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    // ToDo: check if user is allowed to view this notes revision
    try {
      return this.revisionsService.toRevisionDto(
        await this.revisionsService.getRevision(noteIdOrAlias, revisionId),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
