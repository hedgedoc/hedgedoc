/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel, PermissionLevelNames } from '@hedgedoc/commons';
import { SpecialGroup } from '@hedgedoc/database';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import noteConfiguration, { NoteConfig } from '../../../config/note.config';
import { ChangeNoteOwnerDto } from '../../../dtos/change-note-owner.dto';
import { ChangeNoteVisibilityDto } from '../../../dtos/change-note-visibility.dto';
import { MediaUploadDto } from '../../../dtos/media-upload.dto';
import { NoteGroupPermissionEntryDto } from '../../../dtos/note-group-permission-entry.dto';
import { NoteGroupPermissionUpdateDto } from '../../../dtos/note-group-permission-update.dto';
import { NoteMetadataDto } from '../../../dtos/note-metadata.dto';
import { NotePermissionsDto } from '../../../dtos/note-permissions.dto';
import { NoteUserPermissionEntryDto } from '../../../dtos/note-user-permission-entry.dto';
import { NoteUserPermissionUpdateDto } from '../../../dtos/note-user-permission-update.dto';
import { NoteDto } from '../../../dtos/note.dto';
import { NoteMediaDeletionDto } from '../../../dtos/note.media-deletion.dto';
import { RevisionMetadataDto } from '../../../dtos/revision-metadata.dto';
import { RevisionDto } from '../../../dtos/revision.dto';
import { NotInDBError, PermissionError } from '../../../errors/errors';
import { GroupsService } from '../../../groups/groups.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { NoteService } from '../../../notes/note.service';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { convertEditabilityToPermissionLevel } from '../../../permissions/utils/convert-editability-to-permission-level';
import { RevisionsService } from '../../../revisions/revisions.service';
import { UsersService } from '../../../users/users.service';
import { MarkdownBody } from '../../utils/decorators/markdown-body.decorator';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestNoteId } from '../../utils/decorators/request-note-id.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { GetNoteIdInterceptor } from '../../utils/interceptors/get-note-id.interceptor';

@UseGuards(SessionGuard, PermissionsGuard)
@OpenApi(401, 403)
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NoteService,
    private userService: UsersService,
    private mediaService: MediaService,
    private revisionsService: RevisionsService,
    private permissionService: PermissionService,
    private groupService: GroupsService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
  ) {
    this.logger.setContext(NotesController.name);
  }

  @Get(':noteAlias')
  @OpenApi(200)
  @RequirePermission(PermissionLevel.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNote(
    @RequestNoteId() noteId: number,
    @RequestUserId() userId: number,
  ): Promise<NoteDto> {
    // We don't await the marking promise to not delay the response
    void this.noteService.markNoteAsVisited(noteId, userId);
    return await this.noteService.toNoteDto(noteId);
  }

  @Get(':noteAlias/media')
  @OpenApi(200)
  @RequirePermission(PermissionLevel.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNotesMedia(@RequestNoteId() noteId: number): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    return await this.mediaService.getMediaUploadDtosByUuids(media);
  }

  @Post()
  @OpenApi(201, 413)
  @RequirePermission(PermissionLevel.FULL)
  async createNote(
    @RequestUserId() userId: number,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    const createdNoteId = await this.noteService.createNote(text, userId);
    return await this.noteService.toNoteDto(createdNoteId);
  }

  @Post(':newNoteAlias')
  @OpenApi(201, 400, 404, 409, 413)
  @RequirePermission(PermissionLevel.FULL)
  async createNamedNote(
    @RequestUserId() userId: number,
    @Param('newNoteAlias') noteAlias: string,
    @MarkdownBody() text: string,
  ): Promise<NoteDto> {
    const createdNoteId = await this.noteService.createNote(text, userId, noteAlias);
    return await this.noteService.toNoteDto(createdNoteId);
  }

  @Delete(':noteAlias')
  @OpenApi(204, 404, 500)
  @RequirePermission(PermissionLevel.FULL)
  @UseInterceptors(GetNoteIdInterceptor)
  async deleteNote(
    @RequestUserId() userId: number,
    @RequestNoteId() noteId: number,
    @Body() noteMediaDeletionDto: NoteMediaDeletionDto,
  ): Promise<void> {
    const isOwner = await this.permissionService.isOwner(userId, noteId);
    if (!isOwner) {
      throw new PermissionError('You do not have the permission to delete this note.');
    }
    const mediaUploads = await this.mediaService.getMediaUploadUuidsByNoteId(noteId);
    for (const mediaUpload of mediaUploads) {
      if (!noteMediaDeletionDto.keepMedia) {
        await this.mediaService.deleteFile(mediaUpload);
      } else {
        await this.mediaService.removeNoteFromMediaUpload(mediaUpload);
      }
    }
    await this.noteService.deleteNote(noteId);
    this.logger.debug(`Successfully deleted ${noteId}`, 'deleteNote');
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.READ)
  @Get(':noteAlias/metadata')
  async getNoteMetadata(@RequestNoteId() noteId: number): Promise<NoteMetadataDto> {
    return await this.noteService.toNoteMetadataDto(noteId);
  }

  @Get(':noteAlias/revisions')
  @OpenApi(200, 404)
  @RequirePermission(PermissionLevel.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNoteRevisions(@RequestNoteId() noteId: number): Promise<RevisionMetadataDto[]> {
    return await this.revisionsService.getAllRevisionMetadataDto(noteId);
  }

  @Delete(':noteAlias/revisions')
  @OpenApi(204, 404)
  @RequirePermission(PermissionLevel.FULL)
  @UseInterceptors(GetNoteIdInterceptor)
  async purgeNoteRevisions(@RequestNoteId() noteId: number): Promise<void> {
    await this.revisionsService.purgeRevisions(noteId);
    this.logger.debug(`Successfully purged history of note ${noteId}`, 'purgeNoteRevisions');
  }

  @Get(':noteAlias/revisions/:revisionUuid')
  @OpenApi(200, 404)
  @RequirePermission(PermissionLevel.READ)
  @UseInterceptors(GetNoteIdInterceptor)
  async getNoteRevision(@Param('revisionUuid') revisionUuid: string): Promise<RevisionDto> {
    return await this.revisionsService.getRevisionDto(revisionUuid);
  }

  @Put(':noteAlias/metadata/permissions/users/:username')
  @OpenApi(200, 403, 404)
  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  async setUserPermission(
    @RequestNoteId() noteId: number,
    @Param('username') username: NoteUserPermissionUpdateDto['username'],
    @Body('canEdit') canEdit: NoteUserPermissionUpdateDto['canEdit'],
  ): Promise<NotePermissionsDto> {
    const userId = await this.userService.getUserIdByUsername(username);
    await this.permissionService.setUserPermission(noteId, userId, canEdit);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Delete(':noteAlias/metadata/permissions/users/:username')
  async removeUserPermission(
    @RequestNoteId() noteId: number,
    @Param('username') username: NoteUserPermissionEntryDto['username'],
  ): Promise<NotePermissionsDto> {
    try {
      const userId = await this.userService.getUserIdByUsername(username);
      await this.permissionService.removeUserPermission(noteId, userId);
      return await this.permissionService.getPermissionsDtoForNote(noteId);
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new BadRequestException("Can't remove user from permissions. User not known.");
      }
      throw e;
    }
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/groups/:groupName')
  async setGroupPermission(
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: NoteGroupPermissionUpdateDto['groupName'],
    @Body('canEdit') canEdit: NoteGroupPermissionUpdateDto['canEdit'],
  ): Promise<NotePermissionsDto> {
    if ((groupName as SpecialGroup) === SpecialGroup.EVERYONE) {
      const maxGuestPermissionLevel = this.noteConfig.permissions.maxGuestLevel;
      const requestedPermissionLevel = convertEditabilityToPermissionLevel(canEdit);
      if (requestedPermissionLevel > maxGuestPermissionLevel) {
        throw new BadRequestException(
          `Cannot set permission for guest group to '${PermissionLevelNames[requestedPermissionLevel]}' since this is higher than the maximum allowed permission level.`,
        );
      }
    }
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.setGroupPermission(noteId, groupId, canEdit);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @UseGuards(PermissionsGuard)
  @Delete(':noteAlias/metadata/permissions/groups/:groupName')
  async removeGroupPermission(
    @RequestNoteId() noteId: number,
    @Param('groupName') groupName: NoteGroupPermissionEntryDto['groupName'],
  ): Promise<NotePermissionsDto> {
    const groupId = await this.groupService.getGroupIdByName(groupName);
    await this.permissionService.removeGroupPermission(noteId, groupId);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/owner')
  async changeOwner(
    @RequestNoteId() noteId: number,
    @Body() changeNoteOwnerDto: ChangeNoteOwnerDto,
  ): Promise<NotePermissionsDto> {
    const newOwnerId = await this.userService.getUserIdByUsername(changeNoteOwnerDto.owner);
    await this.permissionService.changeOwner(noteId, newOwnerId);
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }

  @UseInterceptors(GetNoteIdInterceptor)
  @RequirePermission(PermissionLevel.FULL)
  @Put(':noteAlias/metadata/permissions/visibility')
  async changeVisibility(
    @RequestNoteId() noteId: number,
    @Body() changeNoteVisibilityDto: ChangeNoteVisibilityDto,
  ): Promise<NotePermissionsDto> {
    await this.permissionService.changePubliclyVisible(
      noteId,
      changeNoteVisibilityDto.publiclyVisible,
    );
    return await this.permissionService.getPermissionsDtoForNote(noteId);
  }
}
