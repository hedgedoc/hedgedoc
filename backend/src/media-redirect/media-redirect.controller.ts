/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { OpenApi } from '../api/utils/decorators/openapi.decorator';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { MediaService } from '../media/media.service';
import { RequestUserId } from '../api/utils/decorators/request-user-id.decorator';
import { PermissionError } from '../errors/errors';

@OpenApi()
@ApiTags('media-redirect')
@Controller()
export class MediaRedirectController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private mediaService: MediaService,
  ) {
    this.logger.setContext(MediaRedirectController.name);
  }

  @Get(':uuid')
  @OpenApi(302, 404, 500)
  async getMedia(
    @RequestUserId() userId: number,
    @Param('uuid') uuid: string,
    @Res() response: FastifyReply,
  ): Promise<void> {
    if (!(await this.mediaService.canUserAccessUpload(userId, uuid))) {
      throw new PermissionError('You do not have permission to access this media upload.');
    }
    const url = await this.mediaService.getFileUrl(uuid);
    await response.redirect(url);
  }
}
