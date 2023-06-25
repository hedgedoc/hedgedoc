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
import { AuthToken } from './auth-token.entity';
import { AuthService } from './auth.service';
import { MockAuthGuard } from './mock-auth.guard';
import { TokenAuthGuard, TokenStrategy } from './token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    LoggerModule,
    TypeOrmModule.forFeature([AuthToken]),
  ],
  providers: [AuthService, TokenStrategy, MockAuthGuard, TokenAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
