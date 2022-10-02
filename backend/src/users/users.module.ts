/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Session } from './session.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Identity, Session]), LoggerModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
