/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  LoginUserInfoDto,
  MediaUploadDto,
  ProviderType,
} from '@hedgedoc/commons';
import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaService } from '../../../media/media.service';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUserInfo } from '../../utils/request-user-id.decorator';
import { SessionAuthProvider } from '../../utils/session-authprovider.decorator';

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
  getMe(
    @RequestUserInfo() userId: number,
    @SessionAuthProvider() authProvider: ProviderType,
  ): LoginUserInfoDto {
    return this.userService.toLoginUserInfoDto(userId, authProvider);
  }

  @Get('media')
  @OpenApi(200)
  async getMyMedia(@RequestUserInfo() user: User): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.getMediaUploadUuidsByUserId(user);
    return await Promise.all(
      media.map((media) => this.mediaService.getMediaUploadDtosByUuids(media)),
    );
  }

  @Delete()
  @OpenApi(204, 404, 500)
  async deleteUser(@RequestUserInfo() userId: number): Promise<void> {
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
    @RequestUserInfo() userId: number,
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
