/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { ApiToken } from './api-token.entity';
import { ApiTokenGuard } from './api-token.guard';
import { ApiTokenService } from './api-token.service';
import { MockApiTokenGuard } from './mock-api-token.guard';

@Module({
  imports: [UsersModule, LoggerModule, TypeOrmModule.forFeature([ApiToken])],
  providers: [ApiTokenService, ApiTokenGuard, MockApiTokenGuard],
  exports: [ApiTokenService, ApiTokenGuard],
})
export class ApiTokenModule {}
