/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { AliasModule } from '../../alias/alias.module';
import { NoteModule } from '../../notes/note.module';
import { PermissionsModule } from '../../permissions/permissions.module';
import { SessionModule } from '../../sessions/session.module';
import { UsersModule } from '../../users/users.module';
import { RealtimeNoteModule } from '../realtime-note/realtime-note.module';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [
    AliasModule,
    RealtimeNoteModule,
    NoteModule,
    UsersModule,
    PermissionsModule,
    SessionModule,
  ],
  exports: [WebsocketGateway],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
