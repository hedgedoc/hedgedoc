/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule, Routes } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { KnexModule } from 'nestjs-knex';

import { ApiTokenModule } from './api-token/api-token.module';
import { PrivateApiModule } from './api/private/private-api.module';
import { PublicApiModule } from './api/public/public-api.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import cspConfig from './config/csp.config';
import customizationConfig from './config/customization.config';
import databaseConfig, {
  DatabaseConfig,
  getKnexConfig,
} from './config/database.config';
import externalConfig from './config/external-services.config';
import mediaConfig from './config/media.config';
import noteConfig from './config/note.config';
import { eventModuleConfig } from './events';
import { FrontendConfigModule } from './frontend-config/frontend-config.module';
import { FrontendConfigService } from './frontend-config/frontend-config.service';
import { GroupsModule } from './groups/groups.module';
import { HistoryModule } from './history/history.module';
import { KnexLoggerService } from './logger/knex-logger.service';
import { LoggerModule } from './logger/logger.module';
import { MediaRedirectModule } from './media-redirect/media-redirect.module';
import { MediaModule } from './media/media.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NotesModule } from './notes/notes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { WebsocketModule } from './realtime/websocket/websocket.module';
import { RevisionsModule } from './revisions/revisions.module';
import { SessionModule } from './sessions/session.module';
import { UsersModule } from './users/users.module';

const routes: Routes = [
  {
    path: '/api/v2',
    module: PublicApiModule,
  },
  {
    path: '/api/private',
    module: PrivateApiModule,
  },
  {
    path: '/media',
    module: MediaRedirectModule,
  },
];

@Module({
  imports: [
    RouterModule.register(routes),
    KnexModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [databaseConfig.KEY, KnexLoggerService],
      useFactory: (
        databaseConfig: DatabaseConfig,
        knexLoggerService: KnexLoggerService,
      ) => ({
        config: {
          ...getKnexConfig(databaseConfig),
          log: {
            warn: knexLoggerService.warn.bind(knexLoggerService),
            error: knexLoggerService.error.bind(knexLoggerService),
            deprecate: knexLoggerService.deprecate.bind(knexLoggerService),
            debug: knexLoggerService.debug.bind(knexLoggerService),
          },
          migrations: {
            directory: 'src/database/migrations/',
          },
        },
      }),
    }),
    ConfigModule.forRoot({
      load: [
        appConfig,
        noteConfig,
        mediaConfig,
        cspConfig,
        databaseConfig,
        authConfig,
        customizationConfig,
        externalConfig,
      ],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(eventModuleConfig),
    ScheduleModule.forRoot(),
    NotesModule,
    UsersModule,
    RevisionsModule,
    AuthorsModule,
    PublicApiModule,
    PrivateApiModule,
    HistoryModule,
    MonitoringModule,
    PermissionsModule,
    GroupsModule,
    LoggerModule,
    MediaModule,
    ApiTokenModule,
    FrontendConfigModule,
    WebsocketModule,
    AuthModule,
    SessionModule,
    MediaRedirectModule,
  ],
  controllers: [],
  providers: [FrontendConfigService],
})
export class AppModule {}
