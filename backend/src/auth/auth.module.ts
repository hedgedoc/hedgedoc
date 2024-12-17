/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { LdapService } from './ldap/ldap.service';
import { LocalService } from './local/local.service';
import { OidcService } from './oidc/oidc.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Identity, User]),
    UsersModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [IdentityService, LdapService, LocalService, OidcService],
  exports: [IdentityService, LdapService, LocalService, OidcService],
})
export class AuthModule {}
