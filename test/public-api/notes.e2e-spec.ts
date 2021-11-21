/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import { NotePermissionsUpdateDto } from '../../src/notes/note-permissions.dto';
import { User } from '../../src/users/user.entity';
import { TestSetup } from '../test-setup';

describe('Notes', () => {
  let testSetup: TestSetup;

  let user: User;
  let user2: User;
  let content: string;
  let forbiddenNoteId: string;
  let uploadPath: string;
  let testImage: Buffer;

  beforeAll(async () => {
    testSetup = await TestSetup.create();

    forbiddenNoteId =
      testSetup.configService.get('appConfig').forbiddenNoteIds[0];
    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.app.init();

    user = await testSetup.userService.createUser('hardcoded', 'Testy');
    user2 = await testSetup.userService.createUser(
      'hardcoded2',
      'Max Mustermann',
    );
    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');
  });

  it('POST /notes', async () => {
    const response = await request(testSetup.app.getHttpServer())
      .post('/api/v2/notes')
      .set('Content-Type', 'text/markdown')
      .send(content)
      .expect('Content-Type', /json/)
      .expect(201);
    expect(response.body.metadata?.id).toBeDefined();
    expect(
      await testSetup.notesService.getNoteContent(
        await testSetup.notesService.getNoteByIdOrAlias(
          response.body.metadata.id,
        ),
      ),
    ).toEqual(content);
  });

  describe('GET /notes/{note}', () => {
    it('works with an existing note', async () => {
      // check if we can succefully get a note that exists
      await testSetup.notesService.createNote(content, user, 'test1');
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test1')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with an non-existing note', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('fails with a forbidden note id', async () => {
      // check if a forbidden note correctly returns 400
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/forbiddenNoteId')
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /notes/{note}', () => {
    it('works with a non-existing alias', async () => {
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/v2/notes/test2')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata?.id).toBeDefined();
      return expect(
        await testSetup.notesService.getNoteContent(
          await testSetup.notesService.getNoteByIdOrAlias(
            response.body.metadata?.id,
          ),
        ),
      ).toEqual(content);
    });

    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .post(`/api/v2/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with a existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .post('/api/v2/notes/test2')
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
        const note = await testSetup.notesService.createNote(
          content,
          user,
          noteId,
        );
        await testSetup.mediaService.saveFile(testImage, user, note);
        await request(testSetup.app.getHttpServer())
          .delete(`/api/v2/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: false,
          })
          .expect(204);
        await expect(
          testSetup.notesService.getNoteByIdOrAlias(noteId),
        ).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(
          await testSetup.mediaService.listUploadsByUser(user),
        ).toHaveLength(0);
      });
      it('with an existing alias and keepMedia true', async () => {
        const noteId = 'test3a';
        const note = await testSetup.notesService.createNote(
          content,
          user,
          noteId,
        );
        const url = await testSetup.mediaService.saveFile(
          testImage,
          user,
          note,
        );
        await request(testSetup.app.getHttpServer())
          .delete(`/api/v2/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: true,
          })
          .expect(204);
        await expect(
          testSetup.notesService.getNoteByIdOrAlias(noteId),
        ).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(
          await testSetup.mediaService.listUploadsByUser(user),
        ).toHaveLength(1);
        // Remove /upload/ from path as we just need the filename.
        const fileName = url.replace('/uploads/', '');
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
      });
    });
    it('works with an existing alias with permissions', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        user,

        'test3',
      );
      const updateNotePermission = new NotePermissionsUpdateDto();
      updateNotePermission.sharedToUsers = [
        {
          username: user.username,
          canEdit: true,
        },
      ];
      updateNotePermission.sharedToGroups = [];
      await testSetup.notesService.updateNotePermissions(
        note,
        updateNotePermission,
      );
      const updatedNote = await testSetup.notesService.getNoteByIdOrAlias(
        note.aliases.filter((alias) => alias.primary)[0].name,
      );
      expect(updatedNote.userPermissions).toHaveLength(1);
      expect(updatedNote.userPermissions[0].canEdit).toEqual(
        updateNotePermission.sharedToUsers[0].canEdit,
      );
      expect(updatedNote.userPermissions[0].user.username).toEqual(
        user.username,
      );
      expect(updatedNote.groupPermissions).toHaveLength(0);
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/notes/test3')
        .expect(204);
      await expect(
        testSetup.notesService.getNoteByIdOrAlias('test3'),
      ).rejects.toEqual(
        new NotInDBError("Note with id/alias 'test3' not found."),
      );
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/notes/${forbiddenNoteId}`)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/notes/i_dont_exist')
        .expect(404);
    });
  });

  describe('PUT /notes/{note}', () => {
    const changedContent = 'New note text';
    it('works with existing alias', async () => {
      await testSetup.notesService.createNote(content, user, 'test4');
      const response = await request(testSetup.app.getHttpServer())
        .put('/api/v2/notes/test4')
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(200);
      expect(
        await testSetup.notesService.getNoteContent(
          await testSetup.notesService.getNoteByIdOrAlias('test4'),
        ),
      ).toEqual(changedContent);
      expect(response.body.content).toEqual(changedContent);
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .put(`/api/v2/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .put('/api/v2/notes/i_dont_exist')
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/metadata', () => {
    it('returns complete metadata object', async () => {
      await testSetup.notesService.createNote(content, user, 'test5');
      const metadata = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test5/metadata')
        .expect(200);
      expect(typeof metadata.body.id).toEqual('string');
      expect(metadata.body.aliases).toEqual(['test5']);
      expect(metadata.body.primaryAlias).toEqual('test5');
      expect(metadata.body.title).toEqual('');
      expect(metadata.body.description).toEqual('');
      expect(typeof metadata.body.createTime).toEqual('string');
      expect(metadata.body.editedBy).toEqual([]);
      expect(metadata.body.permissions.owner.username).toEqual('hardcoded');
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.tags).toEqual([]);
      expect(typeof metadata.body.updateTime).toEqual('string');
      expect(typeof metadata.body.updateUser.displayName).toEqual('string');
      expect(typeof metadata.body.updateUser.username).toEqual('string');
      expect(typeof metadata.body.updateUser.email).toEqual('string');
      expect(typeof metadata.body.updateUser.photo).toEqual('string');
      expect(typeof metadata.body.viewCount).toEqual('number');
      expect(metadata.body.editedBy).toEqual([]);
    });

    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/metadata`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/metadata')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      // create a note
      const note = await testSetup.notesService.createNote(
        content,
        user,

        'test5a',
      );
      // save the creation time
      const createDate = (await note.revisions)[0].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await testSetup.notesService.updateNote(note, 'More test content');
      const metadata = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test5a/metadata')
        .expect(200);
      expect(metadata.body.createTime).toEqual(createDate.toISOString());
      expect(metadata.body.updateTime).not.toEqual(createDate.toISOString());
    });
  });

  describe('GET /notes/{note}/revisions', () => {
    it('works with existing alias', async () => {
      await testSetup.notesService.createNote(content, user, 'test6');
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test6/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions/{revision-id}', () => {
    it('works with an existing alias', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        user,

        'test7',
      );
      const revision = await testSetup.notesService.getLatestRevision(note);
      const response = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/test7/revisions/${revision.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/revisions/1`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/revisions/1')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/content', () => {
    it('works with an existing alias', async () => {
      await testSetup.notesService.createNote(content, user, 'test8');
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test8/content')
        .expect(200);
      expect(response.text).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/content`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/content')
        .expect('Content-Type', /text\/markdown/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/media', () => {
    it('works', async () => {
      const alias = 'test9';
      const extraAlias = 'test10';
      const note1 = await testSetup.notesService.createNote(
        content,
        user,
        alias,
      );
      const note2 = await testSetup.notesService.createNote(
        content,
        user,
        extraAlias,
      );
      const httpServer = testSetup.app.getHttpServer();
      const response = await request(httpServer)
        .get(`/api/v2/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const url0 = await testSetup.mediaService.saveFile(
        testImage,
        user,
        note1,
      );
      const url1 = await testSetup.mediaService.saveFile(
        testImage,
        user,
        note2,
      );

      const responseAfter = await request(httpServer)
        .get(`/api/v2/notes/${alias}/media/`)
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
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/i_dont_exist/media/`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it("fails, when user can't read note", async () => {
      const alias = 'test11';
      await testSetup.notesService.createNote(
        'This is a test note.',
        user2,
        alias,
      );
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  afterAll(async () => {
    await testSetup.app.close();
  });
});
