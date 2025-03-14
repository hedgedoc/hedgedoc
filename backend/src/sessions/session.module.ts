/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { SessionService } from './session.service';

@Module({
  imports: [LoggerModule],
  exports: [SessionService],
  providers: [SessionService],
})
export class SessionModule {}
