/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '../logger/logger.module';
import { FrontendConfigService } from './frontend-config.service';

@Module({
  imports: [LoggerModule, ConfigModule],
  providers: [FrontendConfigService],
  exports: [FrontendConfigService],
})
export class FrontendConfigModule {}
