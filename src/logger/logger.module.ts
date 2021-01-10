/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from '@nestjs/common';
import { ConsoleLoggerService } from './console-logger.service';
import { NestConsoleLoggerService } from './nest-console-logger.service';

@Module({
  providers: [ConsoleLoggerService, NestConsoleLoggerService],
  exports: [ConsoleLoggerService, NestConsoleLoggerService],
})
export class LoggerModule {}
