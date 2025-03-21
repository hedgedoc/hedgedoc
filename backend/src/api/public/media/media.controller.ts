/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaUploadDto, MediaUploadSchema } from '@hedgedoc/commons';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { PermissionError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { Note } from '../../../notes/note.entity';
import { PermissionsGuard } from '../../../permissions/permissions.guard';
import { PermissionsService } from '../../../permissions/permissions.service';
import { RequirePermission } from '../../../permissions/require-permission.decorator';
import { RequiredPermission } from '../../../permissions/required-permission.enum';
import { User } from '../../../users/user.entity';
import { NoteHeaderInterceptor } from '../../utils/note-header.interceptor';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestNote } from '../../utils/request-note.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('media')
@ApiSecurity('token')
@Controller('media')
export class MediaController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
    private permissionsService: PermissionsService,
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
    description: 'ID or alias of the parent note',
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
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(NoteHeaderInterceptor)
  @RequirePermission(RequiredPermission.WRITE)
  async uploadMedia(
    @RequestUser() user: User,
    @UploadedFile() file: MulterFile,
    @RequestNote() note: Note,
  ): Promise<MediaUploadDto> {
    if (file === undefined) {
      throw new BadRequestException('Request does not contain a file');
    }
    this.logger.debug(
      `Received filename '${file.originalname}' for note '${note.publicId}' from user '${user.username}'`,
      'uploadMedia',
    );
    const upload = await this.mediaService.saveFile(
      file.originalname,
      file.buffer,
      user,
      note,
    );
    return await this.mediaService.toMediaUploadDto(upload);
  }

  @Get(':uuid')
  @OpenApi(200, 404, 500)
  async getMedia(
    @Param('uuid') uuid: string,
    @Res() response: Response,
  ): Promise<void> {
    const mediaUpload = await this.mediaService.findUploadByUuid(uuid);
    const dto = await this.mediaService.toMediaUploadDto(mediaUpload);
    response.send(dto);
  }

  @Delete(':uuid')
  @OpenApi(204, 403, 404, 500)
  async deleteMedia(
    @RequestUser() user: User,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    const mediaUpload = await this.mediaService.findUploadByUuid(uuid);
    if (
      await this.permissionsService.checkMediaDeletePermission(
        user,
        mediaUpload,
      )
    ) {
      this.logger.debug(
        `Deleting '${uuid}' for user '${user.username}'`,
        'deleteMedia',
      );
      await this.mediaService.deleteFile(mediaUpload);
    } else {
      this.logger.warn(
        `${user.username} tried to delete '${uuid}', but is not the owner of upload or connected note`,
        'deleteMedia',
      );
      const mediaUploadNote = await mediaUpload.note;
      throw new PermissionError(
        `Neither file '${uuid}' nor note '${
          mediaUploadNote?.publicId ?? 'unknown'
        }'is owned by '${user.username}'`,
      );
    }
  }
}
