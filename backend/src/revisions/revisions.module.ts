/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorsModule } from '../authors/authors.module';
import { LoggerModule } from '../logger/logger.module';
import { RangeAuthorship } from './range-authorship.entity';
import { RangeAuthorshipService } from './range-authorship.service';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Revision, RangeAuthorship]),
    LoggerModule,
    ConfigModule,
    AuthorsModule,
  ],
  providers: [RevisionsService, RangeAuthorshipService],
  exports: [RevisionsService, RangeAuthorshipService],
})
export class RevisionsModule {}
