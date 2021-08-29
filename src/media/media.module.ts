/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';
import { AzureBackend } from './backends/azure-backend';
import { FilesystemBackend } from './backends/filesystem-backend';
import { ImgurBackend } from './backends/imgur-backend';
import { S3Backend } from './backends/s3-backend';
import { WebdavBackend } from './backends/webdav-backend';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MediaUpload]),
    NotesModule,
    UsersModule,
    LoggerModule,
    ConfigModule,
  ],
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
