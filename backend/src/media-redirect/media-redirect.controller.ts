/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { OpenApi } from '../api/utils/openapi.decorator';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { MediaService } from '../media/media.service';

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
    @Param('uuid') uuid: string,
    @Res() response: Response,
  ): Promise<void> {
    const mediaUpload = await this.mediaService.findUploadByUuid(uuid);
    const url = await this.mediaService.getFileUrl(mediaUpload);
    response.redirect(url);
  }
}
