/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { GroupsModule } from '../groups/groups.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { ExploreService } from './explore.service';

@Module({
  imports: [GroupsModule, RevisionsModule, PermissionsModule],
  providers: [ExploreService],
  exports: [ExploreService],
})
export class ExploreModule {}
