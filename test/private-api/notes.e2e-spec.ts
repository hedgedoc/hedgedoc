/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalConfigMock from '../../src/config/mock/external-services.config.mock';
import { NotInDBError } from '../../src/errors/errors';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { promises as fs } from 'fs';
import { MediaService } from '../../src/media/media.service';
import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { join } from 'path';

describe('Notes', () => {
  let app: INestApplication;
  let notesService: NotesService;
  let mediaService: MediaService;
  let user: User;
  let user2: User;
  let content: string;
  let forbiddenNoteId: string;
  let uploadPath: string;
  let testImage: Buffer;

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
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-private-notes.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
      ],
    }).compile();

    const config = moduleRef.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('appConfig').forbiddenNoteIds[0];
    uploadPath = config.get('mediaConfig').backend.filesystem.uploadPath;
    app = moduleRef.createNestApplication();
    await app.init();
    notesService = moduleRef.get(NotesService);
    mediaService = moduleRef.get(MediaService);
    const userService = moduleRef.get(UsersService);
    user = await userService.createUser('hardcoded', 'Testy');
    user2 = await userService.createUser('hardcoded2', 'Max Mustermann');
    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');
  });

  it('POST /notes', async () => {
    const response = await request(app.getHttpServer())
      .post('/notes')
      .set('Content-Type', 'text/markdown')
      .send(content)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    expect(
      await notesService.getNoteContent(
        await notesService.getNoteByIdOrAlias(response.body.metadata.id),
      ),
    ).toEqual(content);
  });

  describe('GET /notes/{note}', () => {
    it('works with an existing note', async () => {
      // check if we can succefully get a note that exists
      await notesService.createNote(content, 'test1', user);
      const response = await request(app.getHttpServer())
        .get('/notes/test1')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with an non-existing note', async () => {
      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('POST /notes/{note}', () => {
    it('works with a non-existing alias', async () => {
      const response = await request(app.getHttpServer())
        .post('/notes/test2')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata?.id).toBeDefined();
      return expect(
        await notesService.getNoteContent(
          await notesService.getNoteByIdOrAlias(response.body.metadata?.id),
        ),
      ).toEqual(content);
    });

    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .post(`/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with a existing alias', async () => {
      await request(app.getHttpServer())
        .post('/notes/test2')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('DELETE /notes/{note}', () => {
    describe('works', () => {
      it('with an existing alias and keepMedia false', async () => {
        const noteId = 'test3';
        await notesService.createNote(content, noteId, user);
        await mediaService.saveFile(testImage, user.userName, noteId);
        await request(app.getHttpServer())
          .delete(`/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: false,
          })
          .expect(204);
        await expect(notesService.getNoteByIdOrAlias(noteId)).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(await mediaService.listUploadsByUser(user)).toHaveLength(0);
        await fs.rmdir(uploadPath);
      });
      it('with an existing alias and keepMedia true', async () => {
        const noteId = 'test3a';
        await notesService.createNote(content, noteId, user);
        const url = await mediaService.saveFile(
          testImage,
          user.userName,
          noteId,
        );
        await request(app.getHttpServer())
          .delete(`/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: true,
          })
          .expect(204);
        await expect(notesService.getNoteByIdOrAlias(noteId)).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(await mediaService.listUploadsByUser(user)).toHaveLength(1);
        // Remove /upload/ from path as we just need the filename.
        const fileName = url.replace('/uploads/', '');
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
        await fs.rmdir(uploadPath);
      });
    });
    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .delete(`/notes/${forbiddenNoteId}`)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(app.getHttpServer())
        .delete('/notes/i_dont_exist')
        .expect(404);
    });
  });

  describe('POST /notes/{note}/metadata/alias/{alias}', () => {
    const testAlias = 'aliasTest';
    beforeAll(async () => {
      await notesService.createNote(content, testAlias, user);
    });

    it('works with normal alias', async () => {
      const newAlias = 'normalAlias';
      const metadata = await request(app.getHttpServer())
        .post(`/notes/${testAlias}/metadata/alias/${newAlias}`)
        .expect(201);
      expect(metadata.body.aliases).toContain(newAlias);
      expect(metadata.body.aliases).toContain(testAlias);
      expect(metadata.body.primaryAlias).not.toEqual(newAlias);
    });

    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .post(`/notes/${testAlias}/metadata/alias/${forbiddenNoteId}`)
        .expect(400);
    });
  });

  describe('PUT /notes/{note}/metadata/alias/{alias}', () => {
    const testAlias = 'aliasTest2';
    const newAlias = 'normalAlias2';
    beforeAll(async () => {
      const note = await notesService.createNote(content, testAlias, user);
      await notesService.addAlias(note, newAlias);
    });

    it('works with normal alias', async () => {
      const metadata = await request(app.getHttpServer())
        .put(`/notes/${newAlias}/metadata/alias`)
        .expect(200);
      expect(metadata.body.aliases).toContain(newAlias);
      expect(metadata.body.aliases).toContain(testAlias);
      expect(metadata.body.primaryAlias).toEqual(newAlias);
    });

    it('fails with unknown alias', async () => {
      await request(app.getHttpServer())
        .put(`/notes/i_dont_exist/metadata/alias`)
        .expect(404);
    });
  });

  describe('DELETE /notes/{note}/metadata/alias', () => {
    const testAlias = 'aliasTest3';
    const newAlias = 'normalAlias3';
    beforeAll(async () => {
      const note = await notesService.createNote(content, testAlias, user);
      await notesService.addAlias(note, newAlias);
    });

    it('works with normal alias', async () => {
      const metadata = await request(app.getHttpServer())
        .delete(`/notes/${newAlias}/metadata/alias`)
        .expect(200);
      expect(metadata.body.aliases).toContain(testAlias);
      expect(metadata.body.primaryAlias).toEqual(testAlias);
    });

    it('fails with unknown alias', async () => {
      await request(app.getHttpServer())
        .delete(`/notes/i_dont_exist/metadata/alias/`)
        .expect(404);
    });

    it('fails with primary alias', async () => {
      await request(app.getHttpServer())
        .delete(`/notes/${testAlias}/metadata/alias`)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions', () => {
    it('works with existing alias', async () => {
      await notesService.createNote(content, 'test4', user);
      const response = await request(app.getHttpServer())
        .get('/notes/test4/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .get(`/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions/{revision-id}', () => {
    it('works with an existing alias', async () => {
      const note = await notesService.createNote(content, 'test5', user);
      const revision = await notesService.getLatestRevision(note);
      const response = await request(app.getHttpServer())
        .get(`/notes/test5/revisions/${revision.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .get(`/notes/${forbiddenNoteId}/revisions/1`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist/revisions/1')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/media', () => {
    it('works', async () => {
      const alias = 'test6';
      const extraAlias = 'test7';
      await notesService.createNote(content, alias, user);
      await notesService.createNote(content, extraAlias, user);
      const httpServer = app.getHttpServer();
      const response = await request(httpServer)
        .get(`/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const url0 = await mediaService.saveFile(testImage, 'hardcoded', alias);
      const url1 = await mediaService.saveFile(
        testImage,
        'hardcoded',
        extraAlias,
      );

      const responseAfter = await request(httpServer)
        .get(`/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfter.body).toHaveLength(1);
      expect(responseAfter.body[0].url).toEqual(url0);
      expect(responseAfter.body[0].url).not.toEqual(url1);
      for (const fileUrl of [url0, url1]) {
        const fileName = fileUrl.replace('/uploads/', '');
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
      }
      await fs.rmdir(uploadPath, { recursive: true });
    });
    it('fails, when note does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/notes/i_dont_exist/media/`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it("fails, when user can't read note", async () => {
      const alias = 'test11';
      await notesService.createNote('This is a test note.', alias, user2);
      await request(app.getHttpServer())
        .get(`/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
