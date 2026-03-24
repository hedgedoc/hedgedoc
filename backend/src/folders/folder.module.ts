/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { FolderService } from './folder.service';

@Module({
  imports: [LoggerModule],
  controllers: [],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
