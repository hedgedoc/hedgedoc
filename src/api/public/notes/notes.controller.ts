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
import { NotePermissionsUpdateDto } from '../../../notes/note-permissions.dto';
import { NotesService } from '../../../notes/notes.service';
import { RevisionsService } from '../../../revisions/revisions.service';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { TokenAuthGuard } from '../../../auth/token-auth.guard';

@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  async createNote(@Request() req, @MarkdownBody() text: string) {
    // ToDo: provide user for createNoteDto
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text);
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias')
  async getNote(@Request() req, @Param('noteIdOrAlias') noteIdOrAlias: string) {
    // ToDo: check if user is allowed to view this note
    try {
      return await this.noteService.getNoteDtoByIdOrAlias(noteIdOrAlias);
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
  ) {
    // ToDo: check if user is allowed to view this note
    this.logger.debug('Got raw markdown:\n' + text);
    return this.noteService.createNoteDto(text, noteAlias);
  }

  @UseGuards(TokenAuthGuard)
  @Delete(':noteIdOrAlias')
  async deleteNote(
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ) {
    // ToDo: check if user is allowed to delete this note
    this.logger.debug('Deleting note: ' + noteIdOrAlias);
    try {
      await this.noteService.deleteNoteByIdOrAlias(noteIdOrAlias);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
    this.logger.debug('Successfully deleted ' + noteIdOrAlias);
    return;
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias')
  async updateNote(
    @Request() req,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ) {
    // ToDo: check if user is allowed to change this note
    this.logger.debug('Got raw markdown:\n' + text);
    try {
      return await this.noteService.updateNoteByIdOrAlias(noteIdOrAlias, text);
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
  ) {
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
  ) {
    // ToDo: check if user is allowed to view this notes metadata
    try {
      return await this.noteService.getNoteMetadata(noteIdOrAlias);
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
  ) {
    // ToDo: check if user is allowed to view this notes permissions
    try {
      return await this.noteService.updateNotePermissions(
        noteIdOrAlias,
        updateDto,
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
  ) {
    // ToDo: check if user is allowed to view this notes revisions
    try {
      return await this.revisionsService.getNoteRevisionMetadatas(
        noteIdOrAlias,
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
  ) {
    // ToDo: check if user is allowed to view this notes revision
    try {
      return await this.revisionsService.getNoteRevision(
        noteIdOrAlias,
        revisionId,
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new NotFoundException(e.message);
      }
      throw e;
    }
  }
}
