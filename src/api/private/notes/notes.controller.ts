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
import { ApiTags } from '@nestjs/swagger';

import { TokenAuthGuard } from '../../../auth/token.strategy';
import { NotInDBError } from '../../../errors/errors';
import { GroupsService } from '../../../groups/groups.service';
import { HistoryService } from '../../../history/history.service';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { NoteMetadataDto } from '../../../notes/note-metadata.dto';
import { NotePermissionsDto } from '../../../notes/note-permissions.dto';
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
  @Permissions(Permission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNote(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NoteDto> {
    await this.historyService.updateHistoryEntryTimestamp(note, user);
    return await this.noteService.toNoteDto(note);
  }

  @Get(':noteIdOrAlias/media')
  @OpenApi(200)
  @Permissions(Permission.READ)
  @UseInterceptors(GetNoteInterceptor)
  async getNotesMedia(@RequestNote() note: Note): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByNote(note);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }

  @Post()
  @OpenApi(201, 413)
  @Permissions(Permission.CREATE)
  async createNote(
    @RequestUser() user: User,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    this.logger.debug('Got raw markdown:\n' + text, 'createNote');
    return await this.noteService.toNoteDto(
      await this.noteService.createNote(text, user),
    );
  }

  @Post(':noteAlias')
  @OpenApi(201, 400, 404, 409, 413)
  @Permissions(Permission.CREATE)
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

  @Delete(':noteIdOrAlias')
  @OpenApi(204, 404, 500)
  @Permissions(Permission.OWNER)
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
  @Permissions(Permission.READ)
  @Get(':noteIdOrAlias/metadata')
  async getNoteMetadata(
    @RequestUser() user: User,
    @RequestNote() note: Note,
  ): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(note);
  }

  @Get(':noteIdOrAlias/revisions')
  @OpenApi(200, 404)
  @Permissions(Permission.READ)
  @UseInterceptors(GetNoteInterceptor)
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

  @Delete(':noteIdOrAlias/revisions')
  @OpenApi(204, 404)
  @Permissions(Permission.OWNER)
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
  @Permissions(Permission.READ)
  @UseInterceptors(GetNoteInterceptor)
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
  @Permissions(Permission.OWNER)
  @UseGuards(TokenAuthGuard, PermissionsGuard)
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
}
