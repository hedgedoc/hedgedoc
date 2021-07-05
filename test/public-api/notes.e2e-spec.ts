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
import { PublicApiModule } from '../../src/api/public/public-api.module';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import { NotInDBError } from '../../src/errors/errors';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TokenAuthGuard } from '../../src/auth/token-auth.guard';
import { MockAuthGuard } from '../../src/auth/mock-auth.guard';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { promises as fs } from 'fs';
import { MediaService } from '../../src/media/media.service';
import { NotePermissionsUpdateDto } from '../../src/notes/note-permissions.dto';
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
          load: [mediaConfigMock, appConfigMock],
        }),
        PublicApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-notes.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
      ],
    })
      .overrideGuard(TokenAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

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
      });
    });
    it('works with an existing alias with permissions', async () => {
      const note = await notesService.createNote(content, 'test3', user);
      const updateNotePermission = new NotePermissionsUpdateDto();
      updateNotePermission.sharedToUsers = [
        {
          username: user.userName,
          canEdit: true,
        },
      ];
      updateNotePermission.sharedToGroups = [];
      await notesService.updateNotePermissions(note, updateNotePermission);
      const updatedNote = await notesService.getNoteByIdOrAlias(
        note.aliases.filter((alias) => alias.primary)[0].name,
      );
      expect(updatedNote.userPermissions).toHaveLength(1);
      expect(updatedNote.userPermissions[0].canEdit).toEqual(
        updateNotePermission.sharedToUsers[0].canEdit,
      );
      expect(updatedNote.userPermissions[0].user.userName).toEqual(
        user.userName,
      );
      expect(updatedNote.groupPermissions).toHaveLength(0);
      await request(app.getHttpServer()).delete('/notes/test3').expect(204);
      await expect(notesService.getNoteByIdOrAlias('test3')).rejects.toEqual(
        new NotInDBError("Note with id/alias 'test3' not found."),
      );
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

  describe('PUT /notes/{note}', () => {
    const changedContent = 'New note text';
    it('works with existing alias', async () => {
      await notesService.createNote(content, 'test4', user);
      const response = await request(app.getHttpServer())
        .put('/notes/test4')
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(200);
      expect(
        await notesService.getNoteContent(
          await notesService.getNoteByIdOrAlias('test4'),
        ),
      ).toEqual(changedContent);
      expect(response.body.content).toEqual(changedContent);
    });
    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .put(`/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(app.getHttpServer())
        .put('/notes/i_dont_exist')
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/metadata', () => {
    it('returns complete metadata object', async () => {
      await notesService.createNote(content, 'test5', user);
      const metadata = await request(app.getHttpServer())
        .get('/notes/test5/metadata')
        .expect(200);
      expect(typeof metadata.body.id).toEqual('string');
      expect(metadata.body.aliases).toEqual(['test5']);
      expect(metadata.body.primaryAlias).toEqual('test5');
      expect(metadata.body.title).toEqual('');
      expect(metadata.body.description).toEqual('');
      expect(typeof metadata.body.createTime).toEqual('string');
      expect(metadata.body.editedBy).toEqual([]);
      expect(metadata.body.permissions.owner.userName).toEqual('hardcoded');
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.tags).toEqual([]);
      expect(typeof metadata.body.updateTime).toEqual('string');
      expect(typeof metadata.body.updateUser.displayName).toEqual('string');
      expect(typeof metadata.body.updateUser.userName).toEqual('string');
      expect(typeof metadata.body.updateUser.email).toEqual('string');
      expect(typeof metadata.body.updateUser.photo).toEqual('string');
      expect(typeof metadata.body.viewCount).toEqual('number');
      expect(metadata.body.editedBy).toEqual([]);
    });

    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .get(`/notes/${forbiddenNoteId}/metadata`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist/metadata')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      // create a note
      const note = await notesService.createNote(content, 'test5a', user);
      // save the creation time
      const createDate = (await note.revisions)[0].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await notesService.updateNote(note, 'More test content');
      const metadata = await request(app.getHttpServer())
        .get('/notes/test5a/metadata')
        .expect(200);
      expect(metadata.body.createTime).toEqual(createDate.toISOString());
      expect(metadata.body.updateTime).not.toEqual(createDate.toISOString());
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
      const metadata2 = await request(app.getHttpServer())
        .get(`/notes/${newAlias}/metadata/`)
        .expect(200);
      expect(metadata2.body.aliases).toContain(newAlias);
      expect(metadata2.body.aliases).toContain(testAlias);
      expect(metadata2.body.primaryAlias).not.toEqual(newAlias);
    });

    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .post(`/notes/${testAlias}/metadata/alias/${forbiddenNoteId}`)
        .expect(400);
    });
  });

  describe('PUT /notes/{note}/metadata/alias', () => {
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

  describe('DELETE /notes/{note}/metadata/alias/{alias}', () => {
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
        .delete(`/notes/i_dont_exist/metadata/alias`)
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
      await notesService.createNote(content, 'test6', user);
      const response = await request(app.getHttpServer())
        .get('/notes/test6/revisions')
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
      const note = await notesService.createNote(content, 'test7', user);
      const revision = await notesService.getLatestRevision(note);
      const response = await request(app.getHttpServer())
        .get(`/notes/test7/revisions/${revision.id}`)
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

  describe('GET /notes/{note}/content', () => {
    it('works with an existing alias', async () => {
      await notesService.createNote(content, 'test8', user);
      const response = await request(app.getHttpServer())
        .get('/notes/test8/content')
        .expect(200);
      expect(response.text).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(app.getHttpServer())
        .get(`/notes/${forbiddenNoteId}/content`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(app.getHttpServer())
        .get('/notes/i_dont_exist/content')
        .expect('Content-Type', /text\/markdown/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/media', () => {
    it('works', async () => {
      const alias = 'test9';
      const extraAlias = 'test10';
      await notesService.createNote(content, alias, user);
      await notesService.createNote(content, extraAlias, user);
      const httpServer = app.getHttpServer();
      const response = await request(httpServer)
        .get(`/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
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
