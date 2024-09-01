/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { MockPublicAuthTokenGuard } from './mock-public-auth-token-guard.service';
import { PublicAuthToken } from './public-auth-token.entity';
import { PublicAuthTokenService } from './public-auth-token.service';
import {
  PublicAuthTokenGuard,
  PublicAuthTokenStrategy,
} from './public-auth-token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    LoggerModule,
    TypeOrmModule.forFeature([PublicAuthToken]),
  ],
  providers: [
    PublicAuthTokenService,
    PublicAuthTokenStrategy,
    MockPublicAuthTokenGuard,
    PublicAuthTokenGuard,
  ],
  exports: [PublicAuthTokenService],
})
export class PublicAuthTokenModule {}
