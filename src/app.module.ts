/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from 'nest-router';

import { PrivateApiModule } from './api/private/private-api.module';
import { PublicApiModule } from './api/public/public-api.module';
import { AuthModule } from './auth/auth.module';
import { AuthorsModule } from './authors/authors.module';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import cspConfig from './config/csp.config';
import customizationConfig from './config/customization.config';
import databaseConfig from './config/database.config';
import externalConfig from './config/external-services.config';
import hstsConfig from './config/hsts.config';
import mediaConfig from './config/media.config';
import { FrontendConfigModule } from './frontend-config/frontend-config.module';
import { FrontendConfigService } from './frontend-config/frontend-config.service';
import { GroupsModule } from './groups/groups.module';
import { HistoryModule } from './history/history.module';
import { IdentityModule } from './identity/identity.module';
import { LoggerModule } from './logger/logger.module';
import { MediaModule } from './media/media.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NotesModule } from './notes/notes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RevisionsModule } from './revisions/revisions.module';
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
];

@Module({
  imports: [
    RouterModule.forRoutes(routes),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './hedgedoc.sqlite',
      autoLoadEntities: true,
      synchronize: true, // ToDo: Remove this before release
    }),
    ConfigModule.forRoot({
      load: [
        appConfig,
        mediaConfig,
        hstsConfig,
        cspConfig,
        databaseConfig,
        authConfig,
        customizationConfig,
        externalConfig,
      ],
      isGlobal: true,
    }),
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
    AuthModule,
    FrontendConfigModule,
    IdentityModule,
  ],
  controllers: [],
  providers: [FrontendConfigService],
})
export class AppModule {}
