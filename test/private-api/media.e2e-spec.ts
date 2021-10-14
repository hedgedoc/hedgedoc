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
import { join } from 'path';
import request from 'supertest';

import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthConfig } from '../../src/config/auth.config';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalConfigMock from '../../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { IdentityService } from '../../src/identity/identity.service';
import { ConsoleLoggerService } from '../../src/logger/console-logger.service';
import { LoggerModule } from '../../src/logger/logger.module';
import { MediaModule } from '../../src/media/media.module';
import { MediaService } from '../../src/media/media.service';
import { Note } from '../../src/notes/note.entity';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { User } from '../../src/users/user.entity';
import { UsersService } from '../../src/users/users.service';
import { setupSessionMiddleware } from '../../src/utils/session';
import { ensureDeleted } from '../utils';

describe('Media', () => {
  let identityService: IdentityService;
  let app: NestExpressApplication;
  let mediaService: MediaService;
  let uploadPath: string;
  let agent: request.SuperAgentTest;
  let testNote: Note;
  let user: User;

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
    const authConfig = config.get('authConfig') as AuthConfig;
    setupSessionMiddleware(app, authConfig);
    await app.init();
    const logger = await app.resolve(ConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    app.useLogger(logger);
    identityService = moduleRef.get(IdentityService);
    const notesService: NotesService = moduleRef.get(NotesService);
    const userService: UsersService = moduleRef.get(UsersService);
    user = await userService.createUser('hardcoded', 'Testy');
    testNote = await notesService.createNote(
      'test content',
      'test_upload_media',
    );
    mediaService = moduleRef.get(MediaService);
    await identityService.createLocalIdentity(user, 'test');
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/local/login')
      .send({ username: 'hardcoded', password: 'test' })
      .expect(201);
  });

  describe('POST /media', () => {
    it('works', async () => {
      const uploadResponse = await agent
        .post('/media')
        .attach('file', 'test/private-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'test_upload_media')
        .expect('Content-Type', /json/)
        .expect(201);
      const path: string = uploadResponse.body.link;
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const downloadResponse = await agent.get(path);
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
        await agent
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await agent
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('mediaBackend error', async () => {
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await agent
          .post('/media')
          .attach('file', 'test/private-api/fixtures/test.png')
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
    const testImage = await fs.readFile('test/private-api/fixtures/test.png');
    const url = await mediaService.saveFile(testImage, user, testNote);
    const filename = url.split('/').pop() || '';
    await agent
      .delete('/media/' + filename)
      .expect(204);
  });

  afterAll(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await app.close();
  });
});