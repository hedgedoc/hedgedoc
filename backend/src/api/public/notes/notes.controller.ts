/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  MediaUploadDto,
  MediaUploadSchema,
  NoteDto,
  NoteMediaDeletionDto,
  NoteMetadataDto,
  NoteMetadataSchema,
  NotePermissionsDto,
  NotePermissionsSchema,
  NoteSchema,
  RevisionDto,
  RevisionMetadataDto,
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

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { GroupsService } from '../../../groups/groups.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RequiredPermission } from '../../../permissions/required-permission.enum';
import { RevisionsService } from '../../../revisions/revisions.service';
import { UsersService } from '../../../users/users.service';
import { MarkdownBody } from '../../utils/decorators/markdown-body.decorator';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestNoteId } from '../../utils/decorators/request-note-id.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
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

  @RequirePermission(RequiredPermission.CREATE)
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
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias')
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

  @RequirePermission(RequiredPermission.CREATE)
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
    return await this.noteService.toNoteDto();
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Delete(':noteIdOrAlias')
  @OpenApi(204, 403, 404, 500)
  async deleteNote(
    @RequestUserInfo() user: User,
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
  @RequirePermission(RequiredPermission.WRITE)
  @Put(':noteIdOrAlias')
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
    @RequestUserInfo() user: User,
    @RequestNoteId() note: Note,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
    return await this.noteService.toNoteDto(
      await this.noteService.updateNote(note, text),
    );
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/content')
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
    @RequestUserInfo() user: User,
    @RequestNoteId() note: Note,
  ): Promise<string> {
    return await this.noteService.getNoteContent(note);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/metadata')
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
    @RequestUserInfo() user: User,
    @RequestNoteId() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/metadata/permissions')
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
    @RequestUserInfo() userId: number,
    @RequestNoteId() noteId: number,
  ): Promise<NotePermissionsDto> {
    return await this.permissionService.getPermissionsForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions/users/:userName')
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
    @RequestUserInfo() userId: number,
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
    return await this.permissionService.getPermissionsForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Delete(':noteIdOrAlias/metadata/permissions/users/:userName')
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
    @RequestUserInfo() userId: number,
    @RequestNoteId() noteId: number,
    @Param('userName') username: string,
  ): Promise<NotePermissionsDto> {
    const targetUserId = await this.userService.getUserIdByUsername(username);
    await this.permissionService.removeUserPermission(noteId, targetUserId);
    return await this.permissionService.getPermissionsForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions/groups/:groupName')
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
    @RequestUserInfo() userId: number,
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: string,
    @Body('canEdit') canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.setGroupPermission(noteId, groupId, canEdit);
    return await this.permissionService.getPermissionsForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Delete(':noteIdOrAlias/metadata/permissions/groups/:groupName')
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
    @RequestUserInfo() userId: number,
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: string,
  ): Promise<NotePermissionsDto> {
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.removeGroupPermission(noteId, groupId);
    return await this.permissionService.getPermissionsForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions/owner')
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
    @RequestUserInfo() userId: number,
    @RequestNoteId() noteId: number,
    @Body('newOwner') newOwner: string,
  ): Promise<NoteMetadataDto> {
    const ownerUserId = await this.userService.getUserIdByUsername(newOwner);
    await this.permissionService.changeOwner(noteId, ownerUserId);

    return await this.noteService.toNoteMetadataDto(
      await this.noteService.getNoteById(),
    );
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/revisions')
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
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/revisions/:revisionUuid')
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
    return await this.revisionsService.toRevisionDto(
      await this.revisionsService.getRevision(revisionUuid),
    );
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the note',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getNotesMedia(
    @RequestNoteId() noteId: number,
  ): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    return await Promise.all(
      media.map((media) => this.mediaService.getMediaUploadDtosByUuids(media)),
    );
  }
}
