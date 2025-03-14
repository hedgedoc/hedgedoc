/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { EditService } from './edit.service';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [KnexModule, LoggerModule, ConfigModule],
  providers: [RevisionsService, EditService],
  exports: [RevisionsService, EditService],
})
export class RevisionsModule {}
