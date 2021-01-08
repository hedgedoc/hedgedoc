/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ConfigModule, registerAs } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import * as request from 'supertest';
import { PublicApiModule } from '../../src/api/public/public-api.module';
import appConfigMock from '../../src/config/app.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NestConsoleLoggerService } from '../../src/logger/nest-console-logger.service';
import { MediaModule } from '../../src/media/media.module';
import { MediaService } from '../../src/media/media.service';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { UsersService } from '../../src/users/users.service';

describe('Notes', () => {
  let app: NestExpressApplication;
  let mediaService: MediaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock],
        }),
        PublicApiModule,
        MediaModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-media.sqlite',
          autoLoadEntities: true,
          dropSchema: true,
          synchronize: true,
        }),
        NotesModule,
        PermissionsModule,
        GroupsModule,
        LoggerModule,
      ],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useStaticAssets('uploads', {
      prefix: '/uploads',
    });
    await app.init();
    const logger = await app.resolve(NestConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    app.useLogger(logger);
    const notesService: NotesService = moduleRef.get('NotesService');
    await notesService.createNote('test content', 'test_upload_media');
    const usersService: UsersService = moduleRef.get('UsersService');
    await usersService.createUser('hardcoded', 'Hard Coded');
    mediaService = moduleRef.get('MediaService');
  });

  it('POST /media', async () => {
    const uploadResponse = await request(app.getHttpServer())
      .post('/media')
      .attach('file', 'test/public-api/fixtures/test.png')
      .set('HedgeDoc-Note', 'test_upload_media')
      .expect('Content-Type', /json/)
      .expect(201);
    const path = uploadResponse.body.link;
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const downloadResponse = await request(app.getHttpServer()).get(path);
    expect(downloadResponse.body).toEqual(testImage);
  });

  it('DELETE /media/{filename}', async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url = await mediaService.saveFile(
      testImage,
      'hardcoded',
      'test_upload_media',
    );
    const filename = url.split('/').pop();
    await request(app.getHttpServer())
      .delete('/media/' + filename)
      .expect(200);
  });
});
