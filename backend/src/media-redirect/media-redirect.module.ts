/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { MediaModule } from '../media/media.module';
import { MediaRedirectController } from './media-redirect.controller';

@Module({
  imports: [MediaModule],
  controllers: [MediaRedirectController],
})
export class MediaRedirectModule {}
