/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ChangeNoteOwnerDto,
  MediaUploadDto,
  NoteDto,
  NoteGroupPermissionEntryDto,
  NoteGroupPermissionUpdateDto,
  NoteMediaDeletionDto,
  NoteMetadataDto,
  NotePermissionsDto,
  NoteUserPermissionEntryDto,
  NoteUserPermissionUpdateDto,
  RevisionDto,
  RevisionMetadataDto,
} from '@hedgedoc/commons';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { User } from '../../../database/user.entity';
import { NotInDBError } from '../../../errors/errors';
import { GroupsService } from '../../../groups/groups.service';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { Note } from '../../../notes/note.entity';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RequiredPermission } from '../../../permissions/required-permission.enum';
import { RevisionsService } from '../../../revisions/revisions.service';
import { UsersService } from '../../../users/users.service';
import { GetNoteIdInterceptor } from '../../utils/get-note-id.interceptor';
import { MarkdownBody } from '../../utils/markdown-body.decorator';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestNoteId } from '../../utils/request-note-id.decorator';
import { RequestUserId } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard, PermissionsGuard)
@OpenApi(401, 403)
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NoteService,
    private historyService: HistoryService,
    private userService: UsersService,
    private mediaService: MediaService,
    private revisionsService: RevisionsService,
    private permissionService: PermissionService,
    private groupService: GroupsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Get(':noteIdOrAlias')
  @OpenApi(200)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNote(
    @RequestUserId({ guestsAllowed: true }) user: User | null,
    @RequestNoteId() note: Note,
  ): Promise<NoteDto> {
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Get(':noteIdOrAlias/media')
  @OpenApi(200)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNotesMedia(
    @RequestNoteId() noteId: number,
  ): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    return await Promise.all(
      media.map((media) => this.mediaService.getMediaUploadDtosByUuids(media)),
    );
  }

  @Post()
  @OpenApi(201, 413)
  @RequirePermission(RequiredPermission.CREATE)
  async createNote(
    @RequestUserId({ guestsAllowed: true }) user: User | null,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'createNote');
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user),
    );
  }

  @Post(':noteAlias')
  @OpenApi(201, 400, 404, 409, 413)
  @RequirePermission(RequiredPermission.CREATE)
  async createNamedNote(
    @RequestUserId({ guestsAllowed: true }) userId: User | null,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user, noteAlias),
    );
  }

  @Delete(':noteIdOrAlias')
  @OpenApi(204, 404, 500)
  @RequirePermission(RequiredPermission.OWNER)
  @UseInterceptors(GetNoteIdInterceptor)
  async deleteNote(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    const mediaUploads =
      await this.mediaService.getMediaUploadUuidsByNoteId(note);
    for (const mediaUpload of mediaUploads) {
      if (!noteMediaDeletionDto.keepMedia) {
        await this.mediaService.deleteFile(mediaUpload);
      } else {
        await this.mediaService.removeNoteFromMediaUpload(mediaUpload);
      }
    }
    this.logger.debug(`Deleting note: ${note.id}`, 'deleteNote');
    await this.noteService.deleteNote(note);
    this.logger.debug(`Successfully deleted ${note.id}`, 'deleteNote');
    return;
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/metadata')
  async getNoteMetadata(
    @RequestUserId({ guestsAllowed: true }) user: User | null,
    @RequestNoteId() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @Get(':noteIdOrAlias/revisions')
  @OpenApi(200, 404)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNoteRevisions(
    @RequestUserId({ guestsAllowed: true }) user: User | null,
    @RequestNoteId() note: Note,
  ): Promise<RevisionMetadataDto[]> {
    return await this.revisionsService.getAllRevisionMetadataDto(note);
  }

  @Delete(':noteIdOrAlias/revisions')
  @OpenApi(204, 404)
  @RequirePermission(RequiredPermission.OWNER)
  @UseInterceptors(GetNoteIdInterceptor)
  async purgeNoteRevisions(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
  ): Promise<void> {
    this.logger.debug(
      `Purging history of note: ${noteId}`,
      'purgeNoteRevisions',
    );
    await this.revisionsService.purgeRevisions(noteId);
    this.logger.debug(
      `Successfully purged history of note ${noteId}`,
      'purgeNoteRevisions',
    );
    return;
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  @OpenApi(200, 404)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNoteRevision(
    @RequestUserId({ guestsAllowed: true }) user: User | null,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    return await this.revisionsService.getRevisionDto(revisionId);
  }

  @Put(':noteIdOrAlias/metadata/permissions/users/:username')
  @OpenApi(200, 403, 404)
  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  async setUserPermission(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Param('username') username: NoteUserPermissionUpdateDto['username'],
    @Body('canEdit') canEdit: NoteUserPermissionUpdateDto['canEdit'],
  ): Promise<NotePermissionsDto> {
    const returnedNote = await this.permissionService.setUserPermission(
      note,
      makeUsernameLowercase(username),
      canEdit,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Delete(':noteIdOrAlias/metadata/permissions/users/:username')
  async removeUserPermission(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Param('username') username: NoteUserPermissionEntryDto['username'],
  ): Promise<NotePermissionsDto> {
    try {
      const returnedNote = await this.permissionService.removeUserPermission(
        note,
        username,
      );
      return await this.noteService.toNotePermissionsDto(returnedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException(
          "Can't remove user from permissions. User not known.",
        );
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  async setGroupPermission(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Param('groupName') groupName: NoteGroupPermissionUpdateDto['groupName'],
    @Body('canEdit') canEdit: NoteGroupPermissionUpdateDto['canEdit'],
  ): Promise<NotePermissionsDto> {
    const returnedNote = await this.permissionService.setGroupPermission(
      note,
      groupName,
      canEdit,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @UseGuards(PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  async removeGroupPermission(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Param('groupName') groupName: NoteGroupPermissionEntryDto['groupName'],
  ): Promise<NotePermissionsDto> {
    const returnedNote = await this.permissionService.removeGroupPermission(
      note,
      groupName,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions/owner')
  async changeOwner(
    @RequestUserId() user: User,
    @RequestNoteId() note: Note,
    @Body() changeNoteOwnerDto: ChangeNoteOwnerDto,
  ): Promise<NoteDto> {
    return await this.noteService.toNoteDto(
      await this.permissionService.changeOwner(note, newOwner),
    );
  }
}
