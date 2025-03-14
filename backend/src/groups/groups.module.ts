/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { GroupsService } from './groups.service';

@Module({
  imports: [LoggerModule, KnexModule],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
