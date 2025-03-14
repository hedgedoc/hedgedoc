/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { LoggerModule } from '../logger/logger.module';
import { AliasService } from './alias.service';

@Module({
  imports: [KnexModule, LoggerModule, ConfigModule],
  controllers: [],
  providers: [AliasService],
  exports: [AliasService],
})
export class AliasModule {}
