/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { GroupsService } from './groups.service';

@Module({
  imports: [UsersModule],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
