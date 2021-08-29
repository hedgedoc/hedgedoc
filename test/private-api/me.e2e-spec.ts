/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-unsafe-member-access
*/
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import request from 'supertest';

import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { AuthModule } from '../../src/auth/auth.module';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import { NotInDBError } from '../../src/errors/errors';
import { GroupsModule } from '../../src/groups/groups.module';
import { HistoryModule } from '../../src/history/history.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { MediaModule } from '../../src/media/media.module';
import { MediaService } from '../../src/media/media.service';
import { Note } from '../../src/notes/note.entity';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { UserInfoDto } from '../../src/users/user-info.dto';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';

describe('Me', () => {
  let app: INestApplication;
  let userService: UsersService;
  let mediaService: MediaService;
  let uploadPath: string;
  let user: User;
  let content: string;
  let note1: Note;
  let note2: Note;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            authConfigMock,
            mediaConfigMock,
            customizationConfigMock,
            externalServicesConfigMock,
          ],
        }),
        PrivateApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-private-me.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
        MediaModule,
        HistoryModule,
      ],
    }).compile();
    const config = moduleRef.get<ConfigService>(ConfigService);
    uploadPath = config.get('mediaConfig').backend.filesystem.uploadPath;
    app = moduleRef.createNestApplication();
    await app.init();
    //historyService = moduleRef.get();
    userService = moduleRef.get(UsersService);
    mediaService = moduleRef.get(MediaService);
    user = await userService.createUser('hardcoded', 'Testy');
    const notesService = moduleRef.get(NotesService);
    content = 'This is a test note.';
    note1 = await notesService.createNote(content, null, user);
    note2 = await notesService.createNote(content, 'note2', user);
  });

  it('GET /me', async () => {
    const userInfo = userService.toUserDto(user);
    const response = await request(app.getHttpServer())
      .get('/me')
      .expect('Content-Type', /json/)
      .expect(200);
    const gotUser = response.body as UserInfoDto;
    expect(gotUser).toEqual(userInfo);
  });

  it('GET /me/media', async () => {
    const httpServer = app.getHttpServer();
    const responseBefore = await request(httpServer)
      .get('/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(responseBefore.body).toHaveLength(0);

    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url0 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note1.publicId,
    );
    const url1 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note1.publicId,
    );
    const url2 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note2.alias ?? '',
    );
    const url3 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note2.alias ?? '',
    );

    const response = await request(httpServer)
      .get('/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].url).toEqual(url0);
    expect(response.body[1].url).toEqual(url1);
    expect(response.body[2].url).toEqual(url2);
    expect(response.body[3].url).toEqual(url3);
    const mediaUploads = await mediaService.listUploadsByUser(user);
    for (const upload of mediaUploads) {
      await mediaService.deleteFile(upload);
    }
    await fs.rmdir(uploadPath);
  });

  it('POST /me/profile', async () => {
    const newDisplayName = 'Another name';
    expect(user.displayName).not.toEqual(newDisplayName);
    await request(app.getHttpServer())
      .post('/me/profile')
      .send({
        name: newDisplayName,
      })
      .expect(200);
    const dbUser = await userService.getUserByUsername('hardcoded');
    expect(dbUser.displayName).toEqual(newDisplayName);
  });

  it('DELETE /me', async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url0 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note1.publicId,
    );
    const dbUser = await userService.getUserByUsername('hardcoded');
    expect(dbUser).toBeInstanceOf(User);
    const mediaUploads = await mediaService.listUploadsByUser(dbUser);
    expect(mediaUploads).toHaveLength(1);
    expect(mediaUploads[0].fileUrl).toEqual(url0);
    await request(app.getHttpServer()).delete('/me').expect(204);
    await expect(userService.getUserByUsername('hardcoded')).rejects.toThrow(
      NotInDBError,
    );
    const mediaUploadsAfter = await mediaService.listUploadsByNote(note1);
    expect(mediaUploadsAfter).toHaveLength(0);
  });
});
