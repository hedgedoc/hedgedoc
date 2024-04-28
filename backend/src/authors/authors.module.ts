/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { Author } from './author.entity';
import { AuthorsService } from './authors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Author]), LoggerModule],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
