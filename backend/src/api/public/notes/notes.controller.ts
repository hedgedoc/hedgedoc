/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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

import { TokenAuthGuard } from '../../../auth/token.strategy';
import { NotInDBError } from '../../../errors/errors';
import { GroupsService } from '../../../groups/groups.service';
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
import { Permission } from '../../../permissions/permissions.enum';
import { PermissionsService } from '../../../permissions/permissions.service';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { RevisionsService } from '../../../revisions/revisions.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { GetNoteInterceptor } from '../../utils/get-note.interceptor';
import { MarkdownBody } from '../../utils/markdown-body.decorator';
import { OpenApi } from '../../utils/openapi.decorator';
import { Permissions } from '../../utils/permissions.decorator';
import { PermissionsGuard } from '../../utils/permissions.guard';
import { RequestNote } from '../../utils/request-note.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(TokenAuthGuard, PermissionsGuard)
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

  @Permissions(Permission.CREATE)
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
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias')
  @OpenApi(
    {
      code: 200,
      description: 'Get information about the newly created note',
      dto: NoteDto,
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

  @Permissions(Permission.CREATE)
  @UseGuards(PermissionsGuard)
  @Post(':noteAlias')
  @OpenApi(
    {
      code: 201,
      description: 'Get information about the newly created note',
      dto: NoteDto,
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
  @Permissions(Permission.OWNER)
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
  @Permissions(Permission.WRITE)
  @Put(':noteIdOrAlias')
  @OpenApi(
    {
      code: 200,
      description: 'The new, changed note',
      dto: NoteDto,
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
  @Permissions(Permission.READ)
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
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias/metadata')
  @OpenApi(
    {
      code: 200,
      description: 'The metadata of the note',
      dto: NoteMetadataDto,
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
  @Permissions(Permission.OWNER)
  @Put(':noteIdOrAlias/metadata/permissions')
  @OpenApi(
    {
      code: 200,
      description: 'The updated permissions of the note',
      dto: NotePermissionsDto,
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
  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/metadata/permissions')
  @OpenApi(
    {
      code: 200,
      description: 'Get the permissions for a note',
      dto: NotePermissionsDto,
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias/metadata/permissions/users/:userName')
  @OpenApi(
    {
      code: 200,
      description: 'Set the permissions for a user on a note',
      dto: NotePermissionsDto,
    },
    403,
    404,
  )
  async setUserPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('userName') username: string,
    @Body() canEdit: boolean,
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/users/:userName')
  @OpenApi(
    {
      code: 200,
      description: 'Remove the permission for a user on a note',
      dto: NotePermissionsDto,
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  @OpenApi(
    {
      code: 200,
      description: 'Set the permissions for a user on a note',
      dto: NotePermissionsDto,
    },
    403,
    404,
  )
  async setGroupPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: string,
    @Body() canEdit: boolean,
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  @OpenApi(
    {
      code: 200,
      description: 'Remove the permission for a group on a note',
      dto: NotePermissionsDto,
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias/metadata/permissions/owner')
  @OpenApi(
    {
      code: 200,
      description: 'Changes the owner of the note',
      dto: NoteDto,
    },
    403,
    404,
  )
  async changeOwner(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body() newOwner: string,
  ): Promise<NoteDto> {
    const owner = await this.userService.getUserByUsername(newOwner);
    return await this.noteService.toNoteDto(
      await this.permissionService.changeOwner(note, owner),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias/revisions')
  @OpenApi(
    {
      code: 200,
      description: 'Revisions of the note',
      isArray: true,
      dto: RevisionMetadataDto,
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
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  @OpenApi(
    {
      code: 200,
      description: 'Revision of the note for the given id or alias',
      dto: RevisionDto,
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
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias/media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the note',
    isArray: true,
    dto: MediaUploadDto,
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
