/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { MediaUploadDto } from '../../../media/media-upload.dto';
import { MediaService } from '../../../media/media.service';
import { UserLoginInfoDto } from '../../../users/user-info.dto';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUser } from '../../utils/request-user.decorator';
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
    @RequestUser() user: User,
    @SessionAuthProvider() authProvider: string,
  ): UserLoginInfoDto {
    return this.userService.toUserLoginInfoDto(user, authProvider);
  }

  @Get('media')
  @OpenApi(200)
  async getMyMedia(@RequestUser() user: User): Promise<MediaUploadDto[]> {
    const media = await this.mediaService.listUploadsByUser(user);
    return await Promise.all(
      media.map((media) => this.mediaService.toMediaUploadDto(media)),
    );
  }

  @Delete()
  @OpenApi(204, 404, 500)
  async deleteUser(@RequestUser() user: User): Promise<void> {
    const mediaUploads = await this.mediaService.listUploadsByUser(user);
    for (const mediaUpload of mediaUploads) {
      await this.mediaService.deleteFile(mediaUpload);
    }
    this.logger.debug(`Deleted all media uploads of ${user.username}`);
    await this.userService.deleteUser(user);
    this.logger.debug(`Deleted ${user.username}`);
  }

  @Post('profile')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', nullable: false },
      },
      required: ['displayName'],
    },
  })
  @OpenApi(200)
  async updateDisplayName(
    @RequestUser() user: User,
    @Body('displayName') newDisplayName: string,
  ): Promise<void> {
    await this.userService.updateUser(
      user,
      newDisplayName,
      undefined,
      undefined,
    );
  }
}
