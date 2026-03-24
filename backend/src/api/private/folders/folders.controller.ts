/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
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
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { CreateFolderDto } from '../../../dtos/create-folder.dto';
import { UpdateFolderDto } from '../../../dtos/update-folder.dto';
import { FolderService } from '../../../folders/folder.service';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { NoteService } from '../../../notes/note.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('folders')
@Controller('folders')
export class FoldersController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly folderService: FolderService,
    private readonly noteService: NoteService,
  ) {
    this.logger.setContext(FoldersController.name);
  }

  @Get()
  @OpenApi(200)
  async getFolders(
    @RequestUserId() userId: number,
    @Query('parentFolderId') parentFolderId?: string,
  ) {
    let parent: number | null | undefined;
    if (parentFolderId === 'null' || parentFolderId === '') {
      parent = null;
    } else if (parentFolderId !== undefined) {
      const parsed = parseInt(parentFolderId, 10);
      if (Number.isNaN(parsed)) {
        throw new BadRequestException('parentFolderId must be a number or "null"');
      }
      parent = parsed;
    }
    const folders = await this.folderService.getFoldersByUser(userId, parent);
    return folders.map((f) => this.folderService.toFolderDto(f));
  }

  @Post()
  @OpenApi(201)
  async createFolder(
    @RequestUserId() userId: number,
    @Body() body: CreateFolderDto,
  ) {
    const folderId = await this.folderService.createFolder(
      body.name,
      userId,
      body.parentFolderId,
    );
    const folder = await this.folderService.getFolderById(folderId);
    return this.folderService.toFolderDto(folder);
  }

  @Get(':folderId')
  @OpenApi(200, 404)
  async getFolder(
    @RequestUserId() userId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
  ) {
    await this.folderService.ensureFolderOwnedByUser(folderId, userId);
    const folder = await this.folderService.getFolderById(folderId);
    return this.folderService.toFolderDto(folder);
  }

  @Put(':folderId')
  @OpenApi(200, 404)
  async updateFolder(
    @RequestUserId() userId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Body() body: UpdateFolderDto,
  ) {
    const folder = await this.folderService.updateFolder(
      folderId,
      userId,
      body.name,
      body.parentFolderId,
    );
    return this.folderService.toFolderDto(folder);
  }

  @Delete(':folderId')
  @OpenApi(204, 404)
  async deleteFolder(
    @RequestUserId() userId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
  ): Promise<void> {
    await this.folderService.deleteFolder(folderId, userId);
  }

  @Put(':folderId/notes/:noteId')
  @OpenApi(200, 404)
  async moveNoteToFolder(
    @RequestUserId() userId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<void> {
    await this.folderService.moveNoteToFolder(noteId, folderId, userId);
  }

  @Delete('notes/:noteId/folder')
  @OpenApi(200, 404)
  async removeNoteFromFolder(
    @RequestUserId() userId: number,
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<void> {
    await this.folderService.moveNoteToFolder(noteId, null, userId);
  }

  @Put('by-alias/:noteAlias/move')
  @OpenApi(200, 404)
  async moveNoteByAlias(
    @RequestUserId() userId: number,
    @Param('noteAlias') noteAlias: string,
    @Body() body: { folderId: number | null },
  ): Promise<void> {
    const noteId = await this.noteService.getNoteIdByAlias(noteAlias);
    await this.folderService.moveNoteToFolder(noteId, body.folderId, userId);
  }
}
