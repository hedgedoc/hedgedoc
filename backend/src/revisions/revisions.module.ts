/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { AliasModule } from '../alias/alias.module';
import { LoggerModule } from '../logger/logger.module';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [KnexModule, LoggerModule, ConfigModule, AliasModule],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
