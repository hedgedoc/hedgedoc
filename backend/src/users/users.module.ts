/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { Session } from '../sessions/session.entity';
import { UsersService } from './users.service';

@Module({
  imports: [KnexModule, LoggerModule, Session],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
