/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import request from 'supertest';
import { PublicApiModule } from '../../src/api/public/public-api.module';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { MediaModule } from '../../src/media/media.module';
import { MediaService } from '../../src/media/media.service';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TokenAuthGuard } from '../../src/auth/token-auth.guard';
import { MockAuthGuard } from '../../src/auth/mock-auth.guard';
import { join } from 'path';
import { ConsoleLoggerService } from '../../src/logger/console-logger.service';
import { ensureDeleted } from '../utils';

describe('Media', () => {
  let app: NestExpressApplication;
  let mediaService: MediaService;
  let uploadPath: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mediaConfigMock, appConfigMock],
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
        AuthModule,
      ],
    })
      .overrideGuard(TokenAuthGuard)
      .useClass(MockAuthGuard)
      .compile();
    const config = moduleRef.get<ConfigService>(ConfigService);
    uploadPath = config.get('mediaConfig').backend.filesystem.uploadPath;
    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(uploadPath, {
      prefix: '/uploads',
    });
    await app.init();
    const logger = await app.resolve(ConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    app.useLogger(logger);
    const notesService: NotesService = moduleRef.get('NotesService');
    await notesService.createNote('test content', 'test_upload_media');
    mediaService = moduleRef.get('MediaService');
  });

  describe('POST /media', () => {
    it('works', async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post('/media')
        .attach('file', 'test/public-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'test_upload_media')
        .expect('Content-Type', /json/)
        .expect(201);
      const path: string = uploadResponse.body.link;
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const downloadResponse = await request(app.getHttpServer()).get(path);
      expect(downloadResponse.body).toEqual(testImage);
      // Remove /uploads/ from path as we just need the filename.
      const fileName = path.replace('/uploads/', '');
      // delete the file afterwards
      await fs.unlink(join(uploadPath, fileName));
    });
    describe('fails:', () => {
      beforeEach(async () => {
        await ensureDeleted(uploadPath);
      });
      it('MIME type not supported', async () => {
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/public-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/public-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('mediaBackend error', async () => {
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/public-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect('Content-Type', /json/)
          .expect(500);
      });
      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  it('DELETE /media/{filename}', async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url = await mediaService.saveFile(
      testImage,
      'hardcoded',
      'test_upload_media',
    );
    const filename = url.split('/').pop() || '';
    await request(app.getHttpServer())
      .delete('/media/' + filename)
      .expect(204);
  });

  afterAll(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await app.close();
  });
});
