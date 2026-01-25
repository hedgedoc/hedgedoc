/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, RouterModule, Routes } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { KnexModule } from 'nest-knexjs';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { join } from 'node:path';

import { AliasModule } from './alias/alias.module';
import { ApiTokenModule } from './api-token/api-token.module';
import { CsrfGuard } from './api/private/csrf/csrf.guard';
import { PrivateApiModule } from './api/private/private-api.module';
import { PublicApiModule } from './api/public/public-api.module';
import { AuthModule } from './auth/auth.module';
import appConfig, { AppConfig } from './config/app.config';
import authConfig from './config/auth.config';
import cspConfig from './config/csp.config';
import customizationConfig from './config/customization.config';
import databaseConfig, { getKnexConfig, PostgresDatabaseConfig } from './config/database.config';
import externalConfig from './config/external-services.config';
import { Loglevel } from './config/loglevel.enum';
import mediaConfig from './config/media.config';
import noteConfig from './config/note.config';
import { eventModuleConfig } from './events';
import { ExploreModule } from './explore/explore.module';
import { FrontendConfigModule } from './frontend-config/frontend-config.module';
import { FrontendConfigService } from './frontend-config/frontend-config.service';
import { GroupsModule } from './groups/groups.module';
import { KnexLoggerService } from './logger/knex-logger.service';
import { LoggerModule } from './logger/logger.module';
import { MediaRedirectModule } from './media-redirect/media-redirect.module';
import { MediaModule } from './media/media.module';
import { MessageModule } from './message/message.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PermissionsModule } from './permissions/permissions.module';
import { WebsocketModule } from './realtime/websocket/websocket.module';
import { RevisionsModule } from './revisions/revisions.module';
import { SessionModule } from './sessions/session.module';
import { UsersModule } from './users/users.module';
import { isDevMode } from './utils/dev-mode';

export const PUBLIC_API_PREFIX = '/api/v2';
export const PRIVATE_API_PREFIX = '/api/private';

const routes: Routes = [
  {
    path: PUBLIC_API_PREFIX,
    module: PublicApiModule,
  },
  {
    path: PRIVATE_API_PREFIX,
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
      imports: [],
      inject: [appConfig.KEY, databaseConfig.KEY, KnexLoggerService],
      useFactory: (
        appConfig: AppConfig,
        databaseConfig: PostgresDatabaseConfig,
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
            directory: join(__dirname, 'database', 'migrations'),
          },
          debug:
            isDevMode() &&
            (appConfig.log.level === Loglevel.DEBUG || appConfig.log.level === Loglevel.TRACE),
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
    AliasModule,
    UsersModule,
    RevisionsModule,
    PublicApiModule,
    PrivateApiModule,
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
    MessageModule,
    ExploreModule,
  ],
  controllers: [],
  providers: [
    FrontendConfigService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
