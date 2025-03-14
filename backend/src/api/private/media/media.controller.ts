/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaUploadDto, MediaUploadSchema } from '@hedgedoc/commons';
import { BadRequestException, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { RequestUserInfo } from 'src/api/utils/request-user-id.decorator';

import { SessionGuard } from '../../../auth/session.guard';
import { PermissionError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RequiredPermission } from '../../../permissions/required-permission.enum';
import { NoteHeaderInterceptor } from '../../utils/note-header.interceptor';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestNoteId } from '../../utils/request-note-id.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
    private permissionsService: PermissionService,
  ) {
    this.logger.setContext(MediaController.name);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiHeader({
    name: 'HedgeDoc-Note',
    description: 'ID or aliases of the parent note',
  })
  @UseGuards(PermissionsGuard)
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(NoteHeaderInterceptor)
  @RequirePermission(RequiredPermission.WRITE)
  @OpenApi(
    {
      code: 201,
      description: 'The file was uploaded successfully',
      schema: MediaUploadSchema,
    },
    400,
    403,
    404,
    500,
  )
  async uploadMedia(
    @UploadedFile() file: MulterFile | undefined,
    @RequestNoteId() noteId: number,
    @RequestUserInfo({ guestsAllowed: true }) userId: number | null,
  ): Promise<string> {
    if (file === undefined) {
      throw new BadRequestException('Request does not contain a file');
    }
    if (userId) {
      this.logger.debug(
        `Received filename '${file.originalname}' for note '${noteId}' from user '${userId}'`,
        'uploadMedia',
      );
    } else {
      this.logger.debug(
        `Received filename '${file.originalname}' for note '${noteId}' from not logged in user`,
        'uploadMedia',
      );
    }
    const uploadUuid = await this.mediaService.saveFile(
      file.originalname,
      file.buffer,
      userId,
      noteId,
    );
    return uploadUuid;
  }

  @Get(':uuid')
  @OpenApi(200, 404, 500)
  async getMedia(@Param('uuid') uuid: string): Promise<MediaUploadDto> {
    return (await this.mediaService.getMediaUploadDtosByUuids([uuid]))[0];
  }

  @Delete(':uuid')
  @OpenApi(204, 403, 404, 500)
  async deleteMedia(
    @RequestUserInfo() userId: number,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    const mediaUpload = await this.mediaService.findUploadByUuid(uuid);
    if (
      await this.permissionsService.checkMediaDeletePermission(userId, uuid)
    ) {
      this.logger.debug(
        `Deleting '${uuid}' for user '${userId}'`,
        'deleteMedia',
      );
      await this.mediaService.deleteFile(mediaUpload);
    } else {
      this.logger.warn(
        `${userId} tried to delete '${uuid}', but is not the owner of upload or connected note`,
        'deleteMedia',
      );
      throw new PermissionError(
        `'${userId}' does neither own the upload '${uuid}' nor the note associacted with this upload'`,
      );
    }
  }
}
