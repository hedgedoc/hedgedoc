/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorsModule } from '../authors/authors.module';
import { LoggerModule } from '../logger/logger.module';
import { Edit } from './edit.entity';
import { EditService } from './edit.service';
import { Revision } from './revision.entity';
import { RevisionsService } from './revisions.service';
import { Note } from '../notes/note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Revision, Edit, Note]),
    LoggerModule,
    ConfigModule,
    AuthorsModule,
  ],
  providers: [RevisionsService, EditService],
  exports: [RevisionsService, EditService],
})
export class RevisionsModule {}
