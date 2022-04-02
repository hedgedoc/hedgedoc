/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { LdapStrategy } from './ldap/ldap.strategy';
import { LocalStrategy } from './local/local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity, User]),
    UsersModule,
    PassportModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [IdentityService, LocalStrategy, LdapStrategy],
  exports: [IdentityService, LocalStrategy, LdapStrategy],
})
export class IdentityModule {}
