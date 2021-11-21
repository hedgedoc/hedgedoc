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
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiProduces,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { TokenAuthGuard } from '../../../auth/token.strategy';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
} from '../../../errors/errors';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from '../../../notes/note-permissions.dto';
import { NoteDto } from '../../../notes/note.dto';
import { Note } from '../../../notes/note.entity';
import { NoteMediaDeletionDto } from '../../../notes/note.media-deletion.dto';
import { NotesService } from '../../../notes/notes.service';
import { Permissions } from '../../../permissions/permissions.decorator';
import { Permission } from '../../../permissions/permissions.enum';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { RevisionsService } from '../../../revisions/revisions.service';
import { User } from '../../../users/user.entity';
import {
  forbiddenDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { FullApi } from '../../utils/fullapi-decorator';
import { GetNotePipe } from '../../utils/get-note.pipe';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { PermissionsGuard } from '../../utils/permissions.guard';
import { RequestUser } from '../../utils/request-user.decorator';

@ApiTags('notes')
@ApiSecurity('token')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private revisionsService: RevisionsService,
    private historyService: HistoryService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Permissions(Permission.CREATE)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Post()
  @HttpCode(201)
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  async createNote(
    @RequestUser() user: User,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text);
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user),
    );
  }

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias')
  @ApiOkResponse({
    description: 'Get information about the newly created note',
    type: NoteDto,
  })
  @FullApi
  async getNote(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<NoteDto> {
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Permissions(Permission.CREATE)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Post(':noteAlias')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Get information about the newly created note',
    type: NoteDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  async createNamedNote(
    @RequestUser() user: User,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
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

  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias')
  @HttpCode(204)
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @FullApi
  async deleteNote(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
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

  @Permissions(Permission.WRITE)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias')
  @ApiOkResponse({
    description: 'The new, changed note',
    type: NoteDto,
  })
  @FullApi
  async updateNote(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
    return await this.noteService.toNoteDto(
      await this.noteService.updateNote(note, text),
    );
  }

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/content')
  @ApiProduces('text/markdown')
  @ApiOkResponse({
    description: 'The raw markdown content of the note',
  })
  @FullApi
  @Header('content-type', 'text/markdown')
  async getNoteContent(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<string> {
    return await this.noteService.getNoteContent(note);
  }

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/metadata')
  @ApiOkResponse({
    description: 'The metadata of the note',
    type: NoteMetadataDto,
  })
  @FullApi
  async getNoteMetadata(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias/metadata/permissions')
  @ApiOkResponse({
    description: 'The updated permissions of the note',
    type: NotePermissionsDto,
  })
  @FullApi
  async updateNotePermissions(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    return this.noteService.toNotePermissionsDto(
      await this.noteService.updateNotePermissions(note, updateDto),
    );
  }

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/revisions')
  @ApiOkResponse({
    description: 'Revisions of the note',
    isArray: true,
    type: RevisionMetadataDto,
  })
  @FullApi
  async getNoteRevisions(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<RevisionMetadataDto[]> {
    const revisions = await this.revisionsService.getAllRevisions(note);
    return await Promise.all(
      revisions.map((revision) =>
        this.revisionsService.toRevisionMetadataDto(revision),
      ),
    );
  }

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  @ApiOkResponse({
    description: 'Revision of the note for the given id or alias',
    type: RevisionDto,
  })
  @FullApi
  async getNoteRevision(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    try {
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

  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/media')
  @ApiOkResponse({
    description: 'All media uploads of the note',
    isArray: true,
    type: MediaUploadDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async getNotesMedia(
    @RequestUser() user: User,
    @Param('noteIdOrAlias', GetNotePipe) note: Note,
  ): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByNote(note);
    return media.map((media) => this.mediaService.toMediaUploadDto(media));
  }
}
