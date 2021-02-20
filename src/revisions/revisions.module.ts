/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { NotesModule } from '../notes/notes.module';
import { Authorship } from './authorship.entity';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Revision, Authorship]),
    forwardRef(() => NotesModule),
    LoggerModule,
    ConfigModule,
  ],
  providers: [RevisionsService],
  exports: [RevisionsService],
})
export class RevisionsModule {}
