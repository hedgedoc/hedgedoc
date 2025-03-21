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
  NotePermissionsUpdateDto,
  NoteSchema,
  RevisionDto,
  RevisionMetadataDto,
  RevisionMetadataSchema,
  RevisionSchema,
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
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { NotInDBError } from '../../../errors/errors';
import { GroupsService } from '../../../groups/groups.service';
import { HistoryService } from '../../../history/history.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { PermissionsService } from '../../../permissions/permissions.service';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RequiredPermission } from '../../../permissions/required-permission.enum';
import { RevisionsService } from '../../../revisions/revisions.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { GetNoteInterceptor } from '../../utils/get-note.interceptor';
import { MarkdownBody } from '../../utils/markdown-body.decorator';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestNote } from '../../utils/request-note.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(ApiTokenGuard, PermissionsGuard)
@OpenApi(401)
@ApiTags('notes')
@ApiSecurity('token')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private userService: UsersService,
    private groupService: GroupsService,
    private revisionsService: RevisionsService,
    private historyService: HistoryService,
    private mediaService: MediaService,
    private permissionService: PermissionsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @RequirePermission(RequiredPermission.CREATE)
  @Post()
  @OpenApi(201, 403, 409, 413)
  async createNote(
    @RequestUser() user: User,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text);
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NoteDto> {
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
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
    @RequestUser() user: User,
    @Param('noteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'createNamedNote');
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user, noteAlias),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Delete(':noteIdOrAlias')
  @OpenApi(204, 403, 404, 500)
  async deleteNote(
    @RequestUser() user: User,
    @RequestNote() note: Note,
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
    this.logger.debug(`Deleting note: ${note.id}`, 'deleteNote');
    await this.noteService.deleteNote(note);
    this.logger.debug(`Successfully deleted ${note.id}`, 'deleteNote');
    return;
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'updateNote');
    return await this.noteService.toNoteDto(
      await this.noteService.updateNote(note, text),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<string> {
    return await this.noteService.getNoteContent(note);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @UseInterceptors(GetNoteInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions')
  @OpenApi(
    {
      code: 200,
      description: 'The updated permissions of the note',
      schema: NotePermissionsSchema,
    },
    403,
    404,
  )
  async updateNotePermissions(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    return await this.noteService.toNotePermissionsDto(
      await this.permissionService.updateNotePermissions(note, updateDto),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NotePermissionsDto> {
    return await this.noteService.toNotePermissionsDto(note);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('userName') username: string,
    @Body('canEdit') canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    const permissionUser = await this.userService.getUserByUsername(username);
    const returnedNote = await this.permissionService.setUserPermission(
      note,
      permissionUser,
      canEdit,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('userName') username: string,
  ): Promise<NotePermissionsDto> {
    try {
      const permissionUser = await this.userService.getUserByUsername(username);
      const returnedNote = await this.permissionService.removeUserPermission(
        note,
        permissionUser,
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

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: string,
    @Body('canEdit') canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    const permissionGroup = await this.groupService.getGroupByName(groupName);
    const returnedNote = await this.permissionService.setGroupPermission(
      note,
      permissionGroup,
      canEdit,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: string,
  ): Promise<NotePermissionsDto> {
    const permissionGroup = await this.groupService.getGroupByName(groupName);
    const returnedNote = await this.permissionService.removeGroupPermission(
      note,
      permissionGroup,
    );
    return await this.noteService.toNotePermissionsDto(returnedNote);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body('newOwner') newOwner: string,
  ): Promise<NoteDto> {
    const owner = await this.userService.getUserByUsername(newOwner);
    return await this.noteService.toNoteDto(
      await this.permissionService.changeOwner(note, owner),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<RevisionMetadataDto[]> {
    const revisions = await this.revisionsService.getAllRevisions(note);
    return await Promise.all(
      revisions.map((revision) =>
        this.revisionsService.toRevisionMetadataDto(revision),
      ),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  @OpenApi(
    {
      code: 200,
      description: 'Revision of the note for the given id or alias',
      schema: RevisionSchema,
    },
    403,
    404,
  )
  async getNoteRevision(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    return await this.revisionsService.toRevisionDto(
      await this.revisionsService.getRevision(note, revisionId),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the note',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getNotesMedia(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByNote(note);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }
}
