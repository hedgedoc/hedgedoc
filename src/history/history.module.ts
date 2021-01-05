/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { HistoryService } from './history.service';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
  imports: [LoggerModule],
})
export class HistoryModule {}
