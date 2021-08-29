/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { MonitoringService } from './monitoring.service';

@Module({
  providers: [MonitoringService],
  exports: [MonitoringService],
  imports: [LoggerModule],
})
export class MonitoringModule {}
