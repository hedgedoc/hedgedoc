/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthProviderType,
  LoginUserInfoDto,
  MediaUploadDto,
} from '@hedgedoc/commons';
import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';
import { SessionAuthProvider } from '../../utils/decorators/session-authprovider.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('me')
@Controller('me')
export class MeController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(MeController.name);
  }

  @Get()
  @OpenApi(200)
  async getMe(
    @RequestUserId() userId: number,
    @SessionAuthProvider() authProvider: AuthProviderType,
  ): Promise<LoginUserInfoDto> {
    const user = await this.userService.getUserById(userId);
    return this.userService.toLoginUserInfoDto(user, authProvider);
  }

  @Get('media')
  @OpenApi(200)
  async getMyMedia(@RequestUserId() userId: number): Promise<MediaUploadDto[]> {
    const mediaUuids =
      await this.mediaService.getMediaUploadUuidsByUserId(userId);
    return await this.mediaService.getMediaUploadDtosByUuids(mediaUuids);
  }

  @Delete()
  @OpenApi(204, 404, 500)
  async deleteUser(@RequestUserId() userId: number): Promise<void> {
    const mediaUploads =
      await this.mediaService.getMediaUploadUuidsByUserId(userId);
    for (const mediaUpload of mediaUploads) {
      await this.mediaService.deleteFile(mediaUpload);
    }
    this.logger.debug(`Deleted all media uploads for user with id ${userId}`);
    await this.userService.deleteUser(userId);
    this.logger.debug(`Deleted user with id ${userId}`);
  }

  @Put('profile')
  @OpenApi(200)
  async updateProfile(
    @RequestUserId() userId: number,
    @Body('displayName') newDisplayName: string,
  ): Promise<void> {
    await this.userService.updateUser(
      userId,
      newDisplayName,
      undefined,
      undefined,
    );
  }
}
