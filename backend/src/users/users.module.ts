/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Identity } from '../auth/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Session } from '../sessions/session.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Identity]), LoggerModule, Session],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
