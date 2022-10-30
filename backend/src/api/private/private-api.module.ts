/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { FrontendConfigModule } from '../../frontend-config/frontend-config.module';
import { GroupsModule } from '../../groups/groups.module';
import { HistoryModule } from '../../history/history.module';
import { IdentityModule } from '../../identity/identity.module';
import { LoggerModule } from '../../logger/logger.module';
import { MediaModule } from '../../media/media.module';
import { NotesModule } from '../../notes/notes.module';
import { PermissionsModule } from '../../permissions/permissions.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { UsersModule } from '../../users/users.module';
import { AliasController } from './alias/alias.controller';
import { AuthController } from './auth/auth.controller';
import { ConfigController } from './config/config.controller';
import { GroupsController } from './groups/groups.controller';
import { HistoryController } from './me/history/history.controller';
import { MeController } from './me/me.controller';
import { MediaController } from './media/media.controller';
import { NotesController } from './notes/notes.controller';
import { TokensController } from './tokens/tokens.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    LoggerModule,
    UsersModule,
    AuthModule,
    FrontendConfigModule,
    HistoryModule,
    PermissionsModule,
    NotesModule,
    MediaModule,
    RevisionsModule,
    IdentityModule,
    GroupsModule,
  ],
  controllers: [
    TokensController,
    ConfigController,
    MediaController,
    HistoryController,
    MeController,
    NotesController,
    AliasController,
    AuthController,
    UsersController,
    GroupsController,
  ],
})
export class PrivateApiModule {}
