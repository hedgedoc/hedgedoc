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
  HttpCode,
  InternalServerErrorException,
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
  ForbiddenIdError,
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
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { HistoryService } from '../../../history/history.service';
import { NoteDto } from '../../../notes/note.dto';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { PermissionsService } from '../../../permissions/permissions.service';
import { Note } from '../../../notes/note.entity';
import { Request } from 'express';
import {
  forbiddenDescription,
  notFoundDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { NoteMediaDeletionDto } from '../../../notes/note.media-deletion.dto';

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
    private mediaService: MediaService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @UseGuards(TokenAuthGuard)
  @Post()
  @HttpCode(201)
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  async createNote(
    @Req() req: Request,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
  @ApiOkResponse({
    description: 'Get information about the newly created note',
    type: NoteDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getNote(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
    if (!this.permissionsService.mayRead(req.user, note)) {
      throw new UnauthorizedException('Reading note denied!');
    }
    await this.historyService.createOrUpdateHistoryEntry(note, req.user);
    return await this.noteService.toNoteDto(note);
  }

  @UseGuards(TokenAuthGuard)
  @Post(':noteAlias')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Get information about the newly created note',
    type: NoteDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  async createNamedNote(
    @Req() req: Request,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Delete(':noteIdOrAlias')
  @HttpCode(204)
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async deleteNote(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.isOwner(req.user, note)) {
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

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias')
  @ApiOkResponse({
    description: 'The new, changed note',
    type: NoteDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async updateNote(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/content')
  @ApiProduces('text/markdown')
  @ApiOkResponse({
    description: 'The raw markdown content of the note',
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  @Header('content-type', 'text/markdown')
  async getNoteContent(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<string> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/metadata')
  @ApiOkResponse({
    description: 'The metadata of the note',
    type: NoteMetadataDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getNoteMetadata(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<NoteMetadataDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Put(':noteIdOrAlias/metadata/permissions')
  @ApiOkResponse({
    description: 'The updated permissions of the note',
    type: NotePermissionsDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async updateNotePermissions(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.isOwner(req.user, note)) {
        throw new UnauthorizedException('Updating note denied!');
      }
      return this.noteService.toNotePermissionsDto(
        await this.noteService.updateNotePermissions(note, updateDto),
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

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/revisions')
  @ApiOkResponse({
    description: 'Revisions of the note',
    isArray: true,
    type: RevisionMetadataDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getNoteRevisions(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<RevisionMetadataDto[]> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  @ApiOkResponse({
    description: 'Revision of the note for the given id or alias',
    type: RevisionDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @ApiNotFoundResponse({ description: notFoundDescription })
  async getNoteRevision(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
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
      if (e instanceof ForbiddenIdError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Get(':noteIdOrAlias/media')
  @ApiOkResponse({
    description: 'All media uploads of the note',
    isArray: true,
    type: MediaUploadDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getNotesMedia(
    @Req() req: Request,
    @Param('noteIdOrAlias') noteIdOrAlias: string,
  ): Promise<MediaUploadDto[]> {
    if (!req.user) {
      // We should never reach this, as the TokenAuthGuard handles missing user info
      throw new InternalServerErrorException('Request did not specify user');
    }
    try {
      const note = await this.noteService.getNoteByIdOrAlias(noteIdOrAlias);
      if (!this.permissionsService.mayRead(req.user, note)) {
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
}
