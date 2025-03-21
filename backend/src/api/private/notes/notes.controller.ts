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

@UseGuards(SessionGuard, PermissionsGuard)
@OpenApi(401, 403)
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private historyService: HistoryService,
    private userService: UsersService,
    private mediaService: MediaService,
    private revisionsService: RevisionsService,
    private permissionService: PermissionsService,
    private groupService: GroupsService,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Get(':noteIdOrAlias')
  @OpenApi(200)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNote(
    @RequestUser({ guestsAllowed: true }) user: User | null,
    @RequestNote() note: Note,
  ): Promise<NoteDto> {
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Get(':noteIdOrAlias/media')
  @OpenApi(200)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNotesMedia(@RequestNote() note: Note): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByNote(note);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }

  @Post()
  @OpenApi(201, 413)
  @RequirePermission(RequiredPermission.CREATE)
  async createNote(
    @RequestUser({ guestsAllowed: true }) user: User | null,
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
    @RequestUser({ guestsAllowed: true }) user: User | null,
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
  @UseInterceptors(GetNoteInterceptor)
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
  @RequirePermission(RequiredPermission.READ)
  @Get(':noteIdOrAlias/metadata')
  async getNoteMetadata(
    @RequestUser({ guestsAllowed: true }) user: User | null,
    @RequestNote() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @Get(':noteIdOrAlias/revisions')
  @OpenApi(200, 404)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNoteRevisions(
    @RequestUser({ guestsAllowed: true }) user: User | null,
    @RequestNote() note: Note,
  ): Promise<RevisionMetadataDto[]> {
    const revisions = await this.revisionsService.getAllRevisions(note);
    return await Promise.all(
      revisions.map((revision) =>
        this.revisionsService.toRevisionMetadataDto(revision),
      ),
    );
  }

  @Delete(':noteIdOrAlias/revisions')
  @OpenApi(204, 404)
  @RequirePermission(RequiredPermission.OWNER)
  @UseInterceptors(GetNoteInterceptor)
  async purgeNoteRevisions(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<void> {
    this.logger.debug(
      `Purging history of note: ${note.id}`,
      'purgeNoteRevisions',
    );
    await this.revisionsService.purgeRevisions(note);
    this.logger.debug(
      `Successfully purged history of note ${note.id}`,
      'purgeNoteRevisions',
    );
    return;
  }

  @Get(':noteIdOrAlias/revisions/:revisionId')
  @OpenApi(200, 404)
  @RequirePermission(RequiredPermission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNoteRevision(
    @RequestUser({ guestsAllowed: true }) user: User | null,
    @RequestNote() note: Note,
    @Param('revisionId') revisionId: number,
  ): Promise<RevisionDto> {
    return await this.revisionsService.toRevisionDto(
      await this.revisionsService.getRevision(note, revisionId),
    );
  }

  @Put(':noteIdOrAlias/metadata/permissions/users/:username')
  @OpenApi(200, 403, 404)
  @UseInterceptors(GetNoteInterceptor)
  @RequirePermission(RequiredPermission.OWNER)
  async setUserPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('username') username: NoteUserPermissionUpdateDto['username'],
    @Body('canEdit') canEdit: NoteUserPermissionUpdateDto['canEdit'],
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
  @Delete(':noteIdOrAlias/metadata/permissions/users/:username')
  async removeUserPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('username') username: NoteUserPermissionEntryDto['username'],
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
  async setGroupPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: NoteGroupPermissionUpdateDto['groupName'],
    @Body('canEdit') canEdit: NoteGroupPermissionUpdateDto['canEdit'],
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
  @UseGuards(PermissionsGuard)
  @Delete(':noteIdOrAlias/metadata/permissions/groups/:groupName')
  async removeGroupPermission(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Param('groupName') groupName: NoteGroupPermissionEntryDto['groupName'],
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
  async changeOwner(
    @RequestUser() user: User,
    @RequestNote() note: Note,
    @Body() changeNoteOwnerDto: ChangeNoteOwnerDto,
  ): Promise<NoteDto> {
    const owner = await this.userService.getUserByUsername(
      changeNoteOwnerDto.owner,
    );
    return await this.noteService.toNoteDto(
      await this.permissionService.changeOwner(note, owner),
    );
  }
}
