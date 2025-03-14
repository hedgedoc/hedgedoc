/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { AliasModule } from '../alias/alias.module';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { AzureBackend } from './backends/azure-backend';
import { FilesystemBackend } from './backends/filesystem-backend';
import { ImgurBackend } from './backends/imgur-backend';
import { S3Backend } from './backends/s3-backend';
import { WebdavBackend } from './backends/webdav-backend';
import { MediaService } from './media.service';

@Module({
  imports: [AliasModule, UsersModule, LoggerModule, ConfigModule, KnexModule],
  providers: [
    MediaService,
    FilesystemBackend,
    AzureBackend,
    ImgurBackend,
    S3Backend,
    WebdavBackend,
  ],
  exports: [MediaService],
})
export class MediaModule {}
