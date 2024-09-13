/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { ApiTokenModule } from '../../api-token/api-token.module';
import { GroupsModule } from '../../groups/groups.module';
import { HistoryModule } from '../../history/history.module';
import { LoggerModule } from '../../logger/logger.module';
import { MediaModule } from '../../media/media.module';
import { MonitoringModule } from '../../monitoring/monitoring.module';
import { NotesModule } from '../../notes/notes.module';
import { PermissionsModule } from '../../permissions/permissions.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { UsersModule } from '../../users/users.module';
import { AliasController } from './alias/alias.controller';
import { MeController } from './me/me.controller';
import { MediaController } from './media/media.controller';
import { MonitoringController } from './monitoring/monitoring.controller';
import { NotesController } from './notes/notes.controller';

@Module({
  imports: [
    ApiTokenModule,
    GroupsModule,
    UsersModule,
    HistoryModule,
    NotesModule,
    RevisionsModule,
    MonitoringModule,
    LoggerModule,
    MediaModule,
    PermissionsModule,
  ],
  controllers: [
    AliasController,
    MeController,
    NotesController,
    MediaController,
    MonitoringController,
  ],
})
export class PublicApiModule {}
