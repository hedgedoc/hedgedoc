/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { ConsoleLoggerService } from './console-logger.service';
import { TypeormLoggerService } from './typeorm-logger.service';

@Module({
  providers: [ConsoleLoggerService, TypeormLoggerService],
  exports: [ConsoleLoggerService, TypeormLoggerService],
})
export class LoggerModule {}
