/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { ApiTokenGuard } from '../api/utils/guards/api-token.guard';
import { MockApiTokenGuard } from '../api/utils/guards/mock-api-token.guard';
import { UsersModule } from '../users/users.module';
import { ApiTokenService } from './api-token.service';

@Module({
  imports: [UsersModule],
  providers: [ApiTokenService, ApiTokenGuard, MockApiTokenGuard],
  exports: [ApiTokenService, ApiTokenGuard],
})
export class ApiTokenModule {}
