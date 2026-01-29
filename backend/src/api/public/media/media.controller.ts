/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaUploadSchema, PermissionLevel } from '@hedgedoc/commons';
import { FieldNameMediaUpload } from '@hedgedoc/database';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { MediaUploadDto } from '../../../dtos/media-upload.dto';
import { PermissionError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { PermissionService } from '../../../permissions/permission.service';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { FastifyFile } from '../../utils/decorators/fastify-file.decorator';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestNoteId } from '../../utils/decorators/request-note-id.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { ApiTokenGuard } from '../../utils/guards/api-token.guard';
import { NoteHeaderInterceptor } from '../../utils/interceptors/note-header.interceptor';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('media')
@ApiSecurity('token')
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
  @UseGuards(PermissionsGuard)
  @UseInterceptors(NoteHeaderInterceptor)
  @RequirePermission(PermissionLevel.WRITE)
  async uploadMedia(
    @RequestUserId() userId: number,
    @FastifyFile('file') file: MulterFile,
    @RequestNoteId() noteId: number,
  ): Promise<MediaUploadDto> {
    if (file === undefined) {
      throw new BadRequestException('Request does not contain a file');
    }
    this.logger.debug(
      `Received filename '${file.originalname}' for note '${noteId}' from user '${userId}'`,
      'uploadMedia',
    );
    const uploadUuid = await this.mediaService.saveFile(
      file.originalname,
      file.buffer,
      userId,
      noteId,
    );
    return (await this.mediaService.getMediaUploadDtosByUuids([uploadUuid]))[0];
  }

  @Get(':uuid')
  @OpenApi(200, 404, 500)
  async getMedia(@Param('uuid') uuid: string): Promise<MediaUploadDto> {
    return (await this.mediaService.getMediaUploadDtosByUuids([uuid]))[0];
  }

  @Delete(':uuid')
  @OpenApi(204, 403, 404, 500)
  async deleteMedia(@RequestUserId() userId: number, @Param('uuid') uuid: string): Promise<void> {
    const mediaUpload = await this.mediaService.findUploadByUuid(uuid);
    if (await this.permissionsService.checkMediaDeletePermission(userId, uuid)) {
      this.logger.debug(`Deleting '${uuid}' for user '${userId}'`, 'deleteMedia');
      await this.mediaService.deleteFile(uuid);
    } else {
      this.logger.warn(
        `${userId} tried to delete '${uuid}', but is not the owner of upload or connected note`,
        'deleteMedia',
      );
      const mediaUploadNote = mediaUpload[FieldNameMediaUpload.noteId];
      throw new PermissionError(
        `Neither file '${uuid}' nor note '${mediaUploadNote ?? 'unknown'}'is owned by '${userId}'`,
      );
    }
  }
}
