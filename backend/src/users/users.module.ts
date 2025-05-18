/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { UsersService } from './users.service';

@Module({
  imports: [KnexModule, LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
