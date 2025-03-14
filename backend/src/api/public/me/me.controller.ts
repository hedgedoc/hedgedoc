/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FullUserInfoSchema,
  LoginUserInfoDto,
  MediaUploadDto,
  MediaUploadSchema,
  NoteMetadataDto,
  NoteMetadataSchema,
  ProviderType,
} from '@hedgedoc/commons';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { User } from 'src/database/types';

import { ApiTokenGuard } from '../../../api-token/api-token.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { NoteService } from '../../../notes/note.service';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUserInfo } from '../../utils/request-user-id.decorator';
import { SessionAuthProvider } from '../../utils/session-authprovider.decorator';

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
    schema: FullUserInfoSchema,
  })
  async getMe(
    @RequestUserInfo() userId: number,
    @SessionAuthProvider() authProvider: ProviderType,
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
    @RequestUserInfo() userId: number,
  ): Promise<NoteMetadataDto[]> {
    const notes = this.notesService.getUserNotes(userId);
    return await Promise.all(
      (await notes).map((note) => this.notesService.toNoteMetadataDto(note)),
    );
  }

  @Get('media')
  @OpenApi({
    code: 200,
    description: 'All media uploads of the user',
    isArray: true,
    schema: MediaUploadSchema,
  })
  async getMyMedia(@RequestUserInfo() userId: number): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByUserId(userId);
    return await Promise.all(
      media.map((media) => this.mediaService.getMediaUploadDtosByUuids(media)),
    );
  }
}
