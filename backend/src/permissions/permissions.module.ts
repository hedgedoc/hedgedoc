/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Module } from '@nestjs/common';

import { GroupsModule } from '../groups/groups.module';
import { NoteModule } from '../notes/note.module';
import { UsersModule } from '../users/users.module';
import { PermissionService } from './permission.service';

@Module({
  imports: [forwardRef(() => NoteModule), UsersModule, GroupsModule],
  exports: [PermissionService],
  providers: [PermissionService],
})
export class PermissionsModule {}
