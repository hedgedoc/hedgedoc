/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Controller,
  Delete,
  Headers,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { PermissionError } from '../../../errors/errors';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadUrlDto } from '../../../media/media-upload-url.dto';
import { MediaService } from '../../../media/media.service';
import { MulterFile } from '../../../media/multer-file.interface';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { User } from '../../../users/user.entity';
import {
  forbiddenDescription,
  successfullyDeletedDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { FullApi } from '../../utils/fullapi-decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
    private noteService: NotesService,
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
  @ApiCreatedResponse({
    description: 'The file was uploaded successfully',
    type: MediaUploadUrlDto,
  })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  @ApiForbiddenResponse({ description: forbiddenDescription })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  async uploadMedia(
    @UploadedFile() file: MulterFile,
    @Headers('HedgeDoc-Note') noteId: string,
    @RequestUser() user: User,
  ): Promise<MediaUploadUrlDto> {
    // TODO: Move getting the Note object into a decorator
    const note: Note = await this.noteService.getNoteByIdOrAlias(noteId);
    this.logger.debug(
      `Recieved filename '${file.originalname}' for note '${noteId}' from user '${user.username}'`,
      'uploadMedia',
    );
    const url = await this.mediaService.saveFile(file.buffer, user, note);
    return this.mediaService.toMediaUploadUrlDto(url);
  }

  @Delete(':filename')
  @HttpCode(204)
  @ApiNoContentResponse({ description: successfullyDeletedDescription })
  @FullApi
  async deleteMedia(
    @RequestUser() user: User,
    @Param('filename') filename: string,
  ): Promise<void> {
    const username = user.username;
    this.logger.debug(
      `Deleting '${filename}' for user '${username}'`,
      'deleteMedia',
    );
    const mediaUpload = await this.mediaService.findUploadByFilename(filename);
    if ((await mediaUpload.user).username !== username) {
      this.logger.warn(
        `${username} tried to delete '${filename}', but is not the owner`,
        'deleteMedia',
      );
      throw new PermissionError(
        `File '${filename}' is not owned by '${username}'`,
      );
    }
    await this.mediaService.deleteFile(mediaUpload);
  }
}
