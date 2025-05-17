/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthProviderType,
  LoginUserInfoDto,
  LoginUserInfoSchema,
  MediaUploadDto,
  MediaUploadSchema,
  NoteMetadataDto,
  NoteMetadataSchema,
} from '@hedgedoc/commons';
import { User } from '@hedgedoc/database';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { NoteService } from '../../../notes/note.service';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { SessionAuthProvider } from '../../utils/decorators/session-authprovider.decorator';
import { ApiTokenGuard } from '../../utils/guards/api-token.guard';

@UseGuards(ApiTokenGuard)
@OpenApi(401)
@ApiTags('me')
@ApiSecurity('token')
@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private notesService: NoteService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @Get()
  @OpenApi({
    code: 200,
    description: 'The user information',
    schema: LoginUserInfoSchema,
  })
  async getMe(
    @RequestUserId() userId: number,
    @SessionAuthProvider() authProvider: AuthProviderType,
  ): Promise<LoginUserInfoDto> {
    const user: User = await this.usersService.getUserById(userId);
    return this.usersService.toLoginUserInfoDto(user, authProvider);
  }

  @Get('notes')
  @OpenApi({
    code: 200,
    description: 'Metadata of all notes of the user',
    isArray: true,
    schema: NoteMetadataSchema,
  })
  async getMyNotes(
    @RequestUserId() userId: number,
  ): Promise<NoteMetadataDto[]> {
    const noteIds = await this.notesService.getUserNoteIds(userId);
    return await Promise.all(
      noteIds.map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }

  @Get('media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the user',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getMyMedia(@RequestUserId() userId: number): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByUserId(userId);
    return await this.mediaService.getMediaUploadDtosByUuids(media);
  }
}
