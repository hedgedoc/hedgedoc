/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { TokenStrategy } from './token.strategy';
import { LoggerModule } from '../logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthToken } from './auth-token.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    LoggerModule,
    TypeOrmModule.forFeature([AuthToken]),
  ],
  providers: [AuthService, TokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
