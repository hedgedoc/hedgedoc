/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from '../logger/logger.module';
import { SessionService } from './session.service';

@Module({
  imports: [LoggerModule, ConfigModule],
  exports: [SessionService],
  providers: [SessionService],
})
export class SessionModule {}
