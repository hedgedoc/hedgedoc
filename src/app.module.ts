/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicApiModule } from './api/public/public-api.module';
import { AuthorsModule } from './authors/authors.module';
import { GroupsModule } from './groups/groups.module';
import { HistoryModule } from './history/history.module';
import { LoggerModule } from './logger/logger.module';
import { MediaModule } from './media/media.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NotesModule } from './notes/notes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RevisionsModule } from './revisions/revisions.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import mediaConfig from './config/media.config';
import hstsConfig from './config/hsts.config';
import cspConfig from './config/csp.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './hedgedoc.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({
      load: [
        appConfig,
        mediaConfig,
        hstsConfig,
        cspConfig,
        databaseConfig,
        authConfig,
      ],
      isGlobal: true,
    }),
    NotesModule,
    UsersModule,
    RevisionsModule,
    AuthorsModule,
    PublicApiModule,
    HistoryModule,
    MonitoringModule,
    PermissionsModule,
    GroupsModule,
    LoggerModule,
    MediaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
