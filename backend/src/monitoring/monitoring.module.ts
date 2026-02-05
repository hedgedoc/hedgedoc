/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [LoggerModule],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
