/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/

import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import * as request from 'supertest';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalConfigMock from '../../src/config/mock/external-services.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NestConsoleLoggerService } from '../../src/logger/nest-console-logger.service';
import { MediaModule } from '../../src/media/media.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { AuthModule } from '../../src/auth/auth.module';
import { join } from 'path';
import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { UsersService } from '../../src/users/users.service';

describe('Media', () => {
  let app: NestExpressApplication;
  let uploadPath: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            mediaConfigMock,
            appConfigMock,
            authConfigMock,
            customizationConfigMock,
            externalConfigMock,
          ],
        }),
        PrivateApiModule,
        MediaModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-private-media.sqlite',
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
    }).compile();
    const config = moduleRef.get<ConfigService>(ConfigService);
    uploadPath = config.get('mediaConfig').backend.filesystem.uploadPath;
    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(uploadPath, {
      prefix: '/uploads',
    });
    await app.init();
    const logger = await app.resolve(NestConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    app.useLogger(logger);
    const notesService: NotesService = moduleRef.get('NotesService');
    await notesService.createNote('test content', 'test_upload_media');
    const userService: UsersService = moduleRef.get('UsersService');
    await userService.createUser('hardcoded', 'Testy');
  });

  describe('POST /media', () => {
    it('works', async () => {
      const uploadResponse = await request(app.getHttpServer())
        .post('/media')
        .attach('file', 'test/private-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'test_upload_media')
        .expect('Content-Type', /json/)
        .expect(201);
      const path: string = uploadResponse.body.link;
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const downloadResponse = await request(app.getHttpServer()).get(path);
      expect(downloadResponse.body).toEqual(testImage);
      // Remove /upload/ from path as we just need the filename.
      const fileName = path.replace('/uploads/', '');
      // delete the file afterwards
      await fs.unlink(join(uploadPath, fileName));
    });
    describe('fails:', () => {
      it('MIME type not supported', async () => {
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect(400);
        expect(await fs.access(uploadPath)).toBeFalsy();
      });
      it('note does not exist', async () => {
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(400);
        expect(await fs.access(uploadPath)).toBeFalsy();
      });
      it('mediaBackend error', async () => {
        await fs.rmdir(uploadPath);
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await request(app.getHttpServer())
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect('Content-Type', /json/)
          .expect(500);
        await fs.rmdir(uploadPath);
      });
    });
  });

  afterAll(async () => {
    // Delete the upload folder
    await fs.rmdir(uploadPath, { recursive: true });
    await app.close();
  });
});
