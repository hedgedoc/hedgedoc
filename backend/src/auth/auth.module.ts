/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { IdentityService } from './identity.service';
import { LdapService } from './ldap/ldap.service';
import { LocalService } from './local/local.service';
import { OidcService } from './oidc/oidc.service';

@Module({
  imports: [UsersModule, LoggerModule, KnexModule],
  controllers: [],
  providers: [IdentityService, LdapService, LocalService, OidcService],
  exports: [IdentityService, LdapService, LocalService, OidcService],
})
export class AuthModule {}
