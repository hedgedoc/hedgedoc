/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { MonitoringService } from './monitoring.service';

@Module({
  providers: [MonitoringService],
  exports: [MonitoringService],
  imports: [],
})
export class MonitoringModule {}
