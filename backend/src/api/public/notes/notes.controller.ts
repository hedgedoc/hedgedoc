/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import {
  MediaUploadSchema,
  NoteMetadataSchema,
  NotePermissionsSchema,
  NoteSchema,
  RevisionMetadataSchema,
  RevisionSchema,
} from '@hedgedoc/commons';
import {
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
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { MediaUploadDto } from '../../../dtos/media-upload.dto';
import { NoteMetadataDto } from '../../../dtos/note-metadata.dto';
import { NotePermissionsDto } from '../../../dtos/note-permissions.dto';
import { NoteDto } from '../../../dtos/note.dto';
import { NoteMediaDeletionDto } from '../../../dtos/note.media-deletion.dto';
import { RevisionMetadataDto } from '../../../dtos/revision-metadata.dto';
import { RevisionDto } from '../../../dtos/revision.dto';
import { GroupsService } from '../../../groups/groups.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RevisionsService } from '../../../revisions/revisions.service';
import { UsersService } from '../../../users/users.service';
import { MarkdownBody } from '../../utils/decorators/markdown-body.decorator';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestNoteId } from '../../utils/decorators/request-note-id.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { ApiTokenGuard } from '../../utils/guards/api-token.guard';
import { GetNoteIdInterceptor } from '../../utils/interceptors/get-note-id.interceptor';

@UseGuards(ApiTokenGuard, PermissionsGuard)
@OpenApi(401)
@ApiTags('notes')
@ApiSecurity('token')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NoteService,
    private userService: UsersService,
    private groupService: GroupsService,
    private revisionsService: RevisionsService,
    private mediaService: MediaService,
    private permissionService: PermissionService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @RequirePermission(PermissionLevel.FULL)
  @Post()
  @OpenApi(201, 403, 409, 413)
  async createNote(
    @RequestUserId() userId: number,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text);
    const newNote = await this.noteService.createNote(text, userId);
    return await this.noteService.toNoteDto(newNote);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias')
  @OpenApi(
    {
      code: 200,
      description: 'Get information about the newly created note',
      schema: NoteSchema,
    },
    403,
    404,
  )
  async getNote(
    @RequestUserId() _userId: number,
    @RequestNoteId() noteId: number,
  ): Promise<NoteDto> {
    return await this.noteService.toNoteDto(noteId);
  }

  @RequirePermission(PermissionLevel.FULL)
  @Post(':noteAlias')
  @OpenApi(
    {
      code: 201,
      description: 'Get information about the newly created note',
      schema: NoteSchema,
    },
    400,
    403,
    409,
    413,
  )
  async createNamedNote(
    @RequestUserId() userId: number,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    const noteId = await this.noteService.createNote(text, userId, noteAlias);
    return await this.noteService.toNoteDto(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Delete(':noteAlias')
  @OpenApi(204, 403, 404, 500)
  async deleteNote(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    const mediaUploads =
      await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    for (const mediaUpload of mediaUploads) {
      if (!noteMediaDeletionDto.keepMedia) {
        await this.mediaService.deleteFile(mediaUpload);
      } else {
        await this.mediaService.removeNoteFromMediaUpload(mediaUpload);
      }
    }
    this.logger.debug(`Deleting note: ${noteId}`, 'deleteNote');
    await this.noteService.deleteNote(noteId);
    this.logger.debug(`Successfully deleted ${noteId}`, 'deleteNote');
    return;
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.WRITE)
  @Put(':noteAlias')
  @OpenApi(
    {
      code: 200,
      description: 'The new, changed note',
      schema: NoteSchema,
    },
    403,
    404,
  )
  async updateNote(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
    await this.noteService.updateNote(noteId, text);
    return await this.noteService.toNoteDto(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/content')
  @OpenApi(
    {
      code: 200,
      description: 'The raw markdown content of the note',
      mimeType: 'text/markdown',
    },
    403,
    404,
  )
  async getNoteContent(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
  ): Promise<string> {
    return await this.noteService.getNoteContent(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/metadata')
  @OpenApi(
    {
      code: 200,
      description: 'The metadata of the note',
      schema: NoteMetadataSchema,
    },
    403,
    404,
  )
  async getNoteMetadata(
    @RequestNoteId() noteId: number,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/metadata/permissions')
  @OpenApi(
    {
      code: 200,
      description: 'Get the permissions for a note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async getPermissions(
    @RequestNoteId() noteId: number,
  ): Promise<NotePermissionsDto> {
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/users/:userName')
  @OpenApi(
    {
      code: 200,
      description: 'Set the permissions for a user on a note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async setUserPermission(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @Param('userName') username: string,
    @Body('canEdit') canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    const targetUserId = await this.userService.getUserIdByUsername(username);
    await this.permissionService.setUserPermission(
      noteId,
      targetUserId,
      canEdit,
    );
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Delete(':noteAlias/metadata/permissions/users/:userName')
  @OpenApi(
    {
      code: 200,
      description: 'Remove the permission for a user on a note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async removeUserPermission(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @Param('userName') username: string,
  ): Promise<NotePermissionsDto> {
    const targetUserId = await this.userService.getUserIdByUsername(username);
    await this.permissionService.removeUserPermission(noteId, targetUserId);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/groups/:groupName')
  @OpenApi(
    {
      code: 200,
      description: 'Set the permissions for a group on a note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async setGroupPermission(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: string,
    @Body('canEdit') canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.setGroupPermission(noteId, groupId, canEdit);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Delete(':noteAlias/metadata/permissions/groups/:groupName')
  @OpenApi(
    {
      code: 200,
      description: 'Remove the permission for a group on a note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async removeGroupPermission(
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: string,
  ): Promise<NotePermissionsDto> {
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.removeGroupPermission(noteId, groupId);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/owner')
  @OpenApi(
    {
      code: 200,
      description: 'Changes the owner of the note',
      schema: NoteSchema,
    },
    403,
    404,
  )
  async changeOwner(
    @RequestNoteId() noteId: number,
    @Body('newOwner') newOwner: string,
  ): Promise<NoteMetadataDto> {
    const ownerUserId = await this.userService.getUserIdByUsername(newOwner);
    await this.permissionService.changeOwner(noteId, ownerUserId);

    return await this.noteService.toNoteMetadataDto(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/revisions')
  @OpenApi(
    {
      code: 200,
      description: 'Revisions of the note',
      isArray: true,
      schema: RevisionMetadataSchema,
    },
    403,
    404,
  )
  async getNoteRevisions(
    @RequestNoteId() noteId: number,
  ): Promise<RevisionMetadataDto[]> {
    return await this.revisionsService.getAllRevisionMetadataDto(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/revisions/:revisionUuid')
  @OpenApi(
    {
      code: 200,
      description: 'Revision of the note for the given id or aliases',
      schema: RevisionSchema,
    },
    403,
    404,
  )
  async getNoteRevision(
    @Param('revisionUuid') revisionUuid: string,
  ): Promise<RevisionDto> {
    return await this.revisionsService.getRevisionDto(revisionUuid);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the note',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getNotesMedia(
    @RequestNoteId() noteId: number,
  ): Promise<MediaUploadDto[]> {
    const mediaUuids =
      await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    return await this.mediaService.getMediaUploadDtosByUuids(mediaUuids);
  }
}
