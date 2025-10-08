/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { PermissionsModule } from '../../permissions/permissions.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { SessionModule } from '../../sessions/session.module';
import { UsersModule } from '../../users/users.module';
import { RealtimeNoteStore } from './realtime-note-store';
import { RealtimeNoteService } from './realtime-note.service';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => PermissionsModule),
    SessionModule,
    RevisionsModule,
    ScheduleModule.forRoot(),
  ],
  exports: [RealtimeNoteService, RealtimeNoteStore],
  providers: [RealtimeNoteService, RealtimeNoteStore],
})
export class RealtimeNoteModule {}
