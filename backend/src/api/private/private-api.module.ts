/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { AliasModule } from '../../alias/alias.module';
import { ApiTokenModule } from '../../api-token/api-token.module';
import { AuthModule } from '../../auth/auth.module';
import { FrontendConfigModule } from '../../frontend-config/frontend-config.module';
import { GroupsModule } from '../../groups/groups.module';
import { LoggerModule } from '../../logger/logger.module';
import { MediaModule } from '../../media/media.module';
import { NoteModule } from '../../notes/note.module';
import { PermissionsModule } from '../../permissions/permissions.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { UsersModule } from '../../users/users.module';
import { AliasController } from './alias/alias.controller';
import { ApiTokensController } from './api-tokens/api-tokens.controller';
import { AuthController } from './auth/auth.controller';
import { GuestController } from './auth/guest/guest.controller';
import { LdapController } from './auth/ldap/ldap.controller';
import { LocalController } from './auth/local/local.controller';
import { OidcController } from './auth/oidc/oidc.controller';
import { ConfigController } from './config/config.controller';
import { GroupsController } from './groups/groups.controller';
import { MeController } from './me/me.controller';
import { MediaController } from './media/media.controller';
import { NotesController } from './notes/notes.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    LoggerModule,
    UsersModule,
    ApiTokenModule,
    FrontendConfigModule,
    PermissionsModule,
    AliasModule,
    MediaModule,
    RevisionsModule,
    AuthModule,
    GroupsModule,
    NoteModule,
  ],
  controllers: [
    ApiTokensController,
    ConfigController,
    GuestController,
    MediaController,
    MeController,
    NotesController,
    AliasController,
    AuthController,
    UsersController,
    GroupsController,
    LdapController,
    LocalController,
    OidcController,
  ],
})
export class PrivateApiModule {}
