/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NotePermissionsUpdateDto } from '@hedgedoc/commons';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Notes', () => {
  let testSetup: TestSetup;

  let content: string;
  let forbiddenNoteId: string;
  let uploadPath: string;
  let testImage: Buffer;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();

    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.app.init();

    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');
  });

  afterAll(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  it('POST /notes', async () => {
    const response = await request(testSetup.app.getHttpServer())
      .post('/api/v2/notes')
      .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
      // check if we can successfully get a note that exists
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/testAlias1')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual('Test Note 1');
    });
    it('fails with an non-existing note', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('fails with a forbidden note id', async () => {
      // check if a forbidden note correctly returns 400
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/forbiddenNoteId')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /notes/{note}', () => {
    it('works with a non-existing alias', async () => {
      const response = await request(testSetup.app.getHttpServer())
        .post('/api/v2/notes/test2')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with a existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .post('/api/v2/notes/test2')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });

    it('fails with a content, that is too long', async () => {
      const content = 'x'.repeat(
        (testSetup.configService.get('noteConfig')
          .maxDocumentLength as number) + 1,
      );
      await request(testSetup.app.getHttpServer())
        .post('/api/v2/notes/test3')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(413);
    });

    it('cannot create an alias equal to a note publicId', async () => {
      await request(testSetup.app.getHttpServer())
        .post(`/api/v2/notes/${testSetup.anonymousNotes[0].publicId}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });

  describe('DELETE /notes/{note}', () => {
    describe('works', () => {
      it('with an existing alias and keepMedia false', async () => {
        const noteId = 'deleteTest1';
        const note = await testSetup.notesService.createNote(
          content,
          testSetup.users[0],
          noteId,
        );
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          testSetup.users[0],
          note,
        );
        await request(testSetup.app.getHttpServer())
          .delete(`/api/v2/notes/${noteId}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
          await testSetup.mediaService.listUploadsByUser(testSetup.users[0]),
        ).toHaveLength(0);
      });
      it('with an existing alias and keepMedia true', async () => {
        const noteId = 'deleteTest2';
        const note = await testSetup.notesService.createNote(
          content,
          testSetup.users[0],
          noteId,
        );
        const upload = await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          testSetup.users[0],
          note,
        );
        await request(testSetup.app.getHttpServer())
          .delete(`/api/v2/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
          await testSetup.mediaService.listUploadsByUser(testSetup.users[0]),
        ).toHaveLength(1);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload.uuid + '.png'));
      });
    });
    it('works with an existing alias with permissions', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'deleteTest3',
      );
      const updateNotePermission: NotePermissionsUpdateDto = {
        sharedToUsers: [
          {
            username: testSetup.users[0].username,
            canEdit: true,
          },
        ],
        sharedToGroups: [],
      };
      await testSetup.permissionsService.updateNotePermissions(
        note,
        updateNotePermission,
      );
      const updatedNote = await testSetup.notesService.getNoteByIdOrAlias(
        (await note.aliases).filter((alias) => alias.primary)[0].name,
      );
      expect(await updatedNote.userPermissions).toHaveLength(1);
      expect((await updatedNote.userPermissions)[0].canEdit).toEqual(
        updateNotePermission.sharedToUsers[0].canEdit,
      );
      expect(
        (await (await updatedNote.userPermissions)[0].user).username,
      ).toEqual(testSetup.users[0].username);
      expect(await updatedNote.groupPermissions).toHaveLength(0);
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/notes/deleteTest3')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({ keepMedia: false })
        .expect(204);
      await expect(
        testSetup.notesService.getNoteByIdOrAlias('deleteTest3'),
      ).rejects.toEqual(
        new NotInDBError("Note with id/alias 'deleteTest3' not found."),
      );
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/notes/${forbiddenNoteId}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/notes/i_dont_exist')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });
  });

  describe('PUT /notes/{note}', () => {
    const changedContent = 'New note text';
    it('works with existing alias', async () => {
      await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test4',
      );
      const response = await request(testSetup.app.getHttpServer())
        .put('/api/v2/notes/test4')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
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
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await request(testSetup.app.getHttpServer())
        .put('/api/v2/notes/i_dont_exist')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/metadata', () => {
    it('returns complete metadata object', async () => {
      await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test5',
      );
      const metadata = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test5/metadata')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
      expect(typeof metadata.body.id).toEqual('string');
      expect(metadata.body.aliases[0].name).toEqual('test5');
      expect(metadata.body.primaryAddress).toEqual('test5');
      expect(metadata.body.title).toEqual('');
      expect(metadata.body.description).toEqual('');
      expect(typeof metadata.body.createdAt).toEqual('string');
      expect(metadata.body.editedBy).toEqual([]);
      expect(metadata.body.permissions.owner).toEqual('testuser1');
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.tags).toEqual([]);
      expect(typeof metadata.body.updatedAt).toEqual('string');
      expect(typeof metadata.body.updateUsername).toEqual('string');
      expect(typeof metadata.body.viewCount).toEqual('number');
      expect(metadata.body.editedBy).toEqual([]);
    });

    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/metadata')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      // create a note
      const note = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test5a',
      );
      // save the creation time
      const createDate = note.createdAt;
      const revisions = await note.revisions;
      const updatedDate = revisions[revisions.length - 1].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await testSetup.notesService.updateNote(note, 'More test content');
      const metadata = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test5a/metadata')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
      expect(metadata.body.createdAt).toEqual(createDate.toISOString());
      expect(metadata.body.updatedAt).not.toEqual(updatedDate.toISOString());
    });
  });

  describe('GET /notes/{note}/revisions', () => {
    it('works with existing alias', async () => {
      await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test6',
      );
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test6/revisions')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/revisions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/revisions')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions/{revision-id}', () => {
    it('works with an existing alias', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test7',
      );
      const revision = await testSetup.revisionsService.getLatestRevision(note);
      const response = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/test7/revisions/${revision.id}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/revisions/1`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/revisions/1')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/content', () => {
    it('works with an existing alias', async () => {
      await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        'test8',
      );
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/test8/content')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
      expect(response.text).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${forbiddenNoteId}/content`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/notes/i_dont_exist/content')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/media', () => {
    it('works', async () => {
      const alias = 'test9';
      const extraAlias = 'test10';
      const note1 = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        alias,
      );
      const note2 = await testSetup.notesService.createNote(
        content,
        testSetup.users[0],
        extraAlias,
      );
      const httpServer = testSetup.app.getHttpServer();
      const response = await request(httpServer)
        .get(`/api/v2/notes/${alias}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload0 = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        note1,
      );
      const upload1 = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        note2,
      );

      const responseAfter = await request(httpServer)
        .get(`/api/v2/notes/${alias}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfter.body).toHaveLength(1);
      expect(responseAfter.body[0].uuid).toEqual(upload0.uuid);
      expect(responseAfter.body[0].uuid).not.toEqual(upload1.uuid);
      for (const upload of [upload0, upload1]) {
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload.uuid + '.png'));
      }
      await fs.rm(uploadPath, { recursive: true });
    });
    it('fails, when note does not exist', async () => {
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/i_dont_exist/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it("fails, when user can't read note", async () => {
      const alias = 'test11';
      await testSetup.notesService.createNote(
        'This is a test note.',
        testSetup.users[1],
        alias,
      );
      // Redact default read permissions
      const note = await testSetup.notesService.getNoteByIdOrAlias(alias);
      const everyone = await testSetup.groupService.getEveryoneGroup();
      const loggedin = await testSetup.groupService.getLoggedInGroup();
      await testSetup.permissionsService.removeGroupPermission(note, everyone);
      await testSetup.permissionsService.removeGroupPermission(note, loggedin);
      await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/${alias}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('permissions', () => {
    it('can be fetched', async function () {
      const permissions = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/testAlias1/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(permissions.body.owner).toBe('testuser1');
      expect(new Set(permissions.body.sharedToUsers)).toEqual(new Set([]));
      expect(new Set(permissions.body.sharedToGroups)).toEqual(
        new Set([
          {
            groupName: '_EVERYONE',
            canEdit: false,
          },
          {
            canEdit: true,
            groupName: '_LOGGED_IN',
          },
        ]),
      );
    });
    it('can be updated', async function () {
      // add permission for testuser2
      await request(testSetup.app.getHttpServer())
        .put(`/api/v2/notes/testAlias1/metadata/permissions/users/testuser2`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          canEdit: true,
        })
        .expect(200);

      // check permissions
      let permissions = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/testAlias1/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
      expect(permissions.body.owner).toBe('testuser1');
      expect(new Set(permissions.body.sharedToUsers)).toEqual(
        new Set([{ username: 'testuser2', canEdit: true }]),
      );
      expect(new Set(permissions.body.sharedToGroups)).toEqual(
        new Set([
          {
            groupName: '_EVERYONE',
            canEdit: false,
          },
          {
            canEdit: true,
            groupName: '_LOGGED_IN',
          },
        ]),
      );

      // add permission for everyone
      await request(testSetup.app.getHttpServer())
        .put(`/api/v2/notes/testAlias1/metadata/permissions/groups/_EVERYONE`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          canEdit: true,
        })
        .expect(200);

      // check permissions
      permissions = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/notes/testAlias1/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(200);
      expect(permissions.body.owner).toBe('testuser1');
      expect(permissions.body.sharedToUsers).toEqual([
        { username: 'testuser2', canEdit: true },
      ]);
      expect(new Set(permissions.body.sharedToGroups)).toEqual(
        new Set([
          { groupName: '_EVERYONE', canEdit: true },
          {
            canEdit: true,
            groupName: '_LOGGED_IN',
          },
        ]),
      );
    });
  });
});
