/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { ScimDiscoveryController } from './scim-discovery.controller';
import { ScimService } from './scim.service';
import { ScimUsersController } from './users/scim-users.controller';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [ScimUsersController, ScimDiscoveryController],
  providers: [ScimService],
})
export class ScimApiModule {}
