/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { PermissionService } from './permission.service';

@Module({
  imports: [KnexModule, LoggerModule],
  exports: [PermissionService],
  providers: [PermissionService],
})
export class PermissionsModule {}
