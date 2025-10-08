/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { FrontendConfigService } from './frontend-config.service';

@Module({
  imports: [],
  providers: [FrontendConfigService],
  exports: [FrontendConfigService],
})
export class FrontendConfigModule {}
