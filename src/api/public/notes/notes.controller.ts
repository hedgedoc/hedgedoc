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
  UseInterceptors,
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
import { Permissions } from '../../../permissions/permissions.decorator';
import { Permission } from '../../../permissions/permissions.enum';
import { RevisionMetadataDto } from '../../../revisions/revision-metadata.dto';
import { RevisionDto } from '../../../revisions/revision.dto';
import { RevisionsService } from '../../../revisions/revisions.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import {
  forbiddenDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { FullApi } from '../../utils/fullapi-decorator';
import { GetNoteInterceptor } from '../../utils/get-note.interceptor';
import { MarkdownBody } from '../../utils/markdownbody-decorator';
import { PermissionsGuard } from '../../utils/permissions.guard';
import { RequestNote } from '../../utils/request-note.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

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

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestNote() note: Note,
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

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias')
  @HttpCode(204)
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @FullApi
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
    this.logger.debug('Deleting note: ' + note.id, 'deleteNote');
    await this.noteService.deleteNote(note);
    this.logger.debug('Successfully deleted ' + note.id, 'deleteNote');
    return;
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestNote() note: Note,
  ): Promise<string> {
    return await this.noteService.getNoteContent(note);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestNote() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestNote() note: Note,
    @Body() updateDto: NotePermissionsUpdateDto,
  ): Promise<NotePermissionsDto> {
    return await this.noteService.toNotePermissionsDto(
      await this.noteService.updateNotePermissions(note, updateDto),
    );
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.READ)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/metadata/permissions')
  @ApiOkResponse({
    description: 'Get the permissions for a note',
    type: NotePermissionsDto,
  })
  @FullApi
  async getPermissions(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NotePermissionsDto> {
    return await this.noteService.toNotePermissionsDto(note);
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/metadata/permissions/users/:userName')
  @ApiOkResponse({
    description: 'Set the permissions for a user on a note',
    type: NotePermissionsDto,
  })
  @FullApi
  async setUserPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('userName') username: string,
    @Body() canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    try {
      const permissionUser = await this.userService.getUserByUsername(username);
      const returnedNote = await this.noteService.setUserPermission(
        note,
        permissionUser,
        canEdit,
      );
      return await this.noteService.toNotePermissionsDto(returnedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException(
          "Can't add user to permissions. User not known.",
        );
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/users/:userName')
  @ApiOkResponse({
    description: 'Remove the permission for a user on a note',
    type: NotePermissionsDto,
  })
  @FullApi
  async removeUserPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('userName') username: string,
  ): Promise<NotePermissionsDto> {
    try {
      const permissionUser = await this.userService.getUserByUsername(username);
      const returnedNote = await this.noteService.removeUserPermission(
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
  @Get(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  @ApiOkResponse({
    description: 'Set the permissions for a user on a note',
    type: NotePermissionsDto,
  })
  @FullApi
  async setGroupPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: string,
    @Body() canEdit: boolean,
  ): Promise<NotePermissionsDto> {
    try {
      const permissionGroup = await this.groupService.getGroupByName(groupName);
      const returnedNote = await this.noteService.setGroupPermission(
        note,
        permissionGroup,
        canEdit,
      );
      return await this.noteService.toNotePermissionsDto(returnedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException(
          "Can't add group to permissions. Group not known.",
        );
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  @ApiOkResponse({
    description: 'Remove the permission for a group on a note',
    type: NotePermissionsDto,
  })
  @FullApi
  async removeGroupPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: string,
  ): Promise<NotePermissionsDto> {
    try {
      const permissionGroup = await this.groupService.getGroupByName(groupName);
      const returnedNote = await this.noteService.removeGroupPermission(
        note,
        permissionGroup,
      );
      return await this.noteService.toNotePermissionsDto(returnedNote);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException(
          "Can't remove group from permissions. Group not known.",
        );
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteInterceptor)
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Put(':noteIdOrAlias/metadata/permissions/owner')
  @ApiOkResponse({
    description: 'Changes the owner of the note',
    type: NoteDto,
  })
  @FullApi
  async changeOwner(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body() newOwner: string,
  ): Promise<NoteDto> {
    try {
      const owner = await this.userService.getUserByUsername(newOwner);
      return await this.noteService.toNoteDto(
        await this.noteService.changeOwner(note, owner),
      );
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException("Can't set new owner. User not known.");
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteInterceptor)
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
  @UseGuards(TokenAuthGuard, PermissionsGuard)
  @Get(':noteIdOrAlias/revisions/:revisionId')
  @ApiOkResponse({
    description: 'Revision of the note for the given id or alias',
    type: RevisionDto,
  })
  @FullApi
  async getNoteRevision(
    @RequestUser() user: User,
    @RequestNote() note: Note,
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

  @UseInterceptors(GetNoteInterceptor)
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
    @RequestNote() note: Note,
  ): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByNote(note);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }
}
