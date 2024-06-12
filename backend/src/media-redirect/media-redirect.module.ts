/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { MediaModule } from '../media/media.module';
import { MediaRedirectController } from './media-redirect.controller';

@Module({
  imports: [MediaModule, LoggerModule],
  controllers: [MediaRedirectController],
})
export class MediaRedirectModule {}
