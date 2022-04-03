/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import { User } from '../../src/users/user.entity';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Notes', () => {
  let testSetup: TestSetup;

  let user: User;
  let user2: User;
  let content: string;
  let forbiddenNoteId: string;
  let uploadPath: string;
  let testImage: Buffer;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().build();

    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.app.init();

    user = await testSetup.userService.createUser('hardcoded', 'Testy');
    await testSetup.identityService.createLocalIdentity(user, 'test');
    user2 = await testSetup.userService.createUser(
      'hardcoded2',
      'Max Mustermann',
    );
    await testSetup.identityService.createLocalIdentity(user2, 'test');
    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: 'hardcoded', password: 'test' })
      .expect(201);
  });

  afterAll(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  it('POST /notes', async () => {
    const response = await agent
      .post('/api/private/notes')
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
      const response = await agent
        .get('/api/private/notes/test1')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with an non-existing note', async () => {
      // check if a missing note correctly returns 404
      await agent
        .get('/api/private/notes/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('POST /notes/{note}', () => {
    it('works with a non-existing alias', async () => {
      const response = await agent
        .post('/api/private/notes/test2')
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
      await agent
        .post(`/api/private/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with a existing alias', async () => {
      await agent
        .post('/api/private/notes/test2')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
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
        await agent
          .delete(`/api/private/notes/${noteId}`)
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
        await fs.rmdir(uploadPath);
      });
      it('with an existing alias and keepMedia true', async () => {
        const noteId = 'test3a';
        const note = await testSetup.notesService.createNote(
          content,
          user,
          noteId,
        );
        const upload = await testSetup.mediaService.saveFile(
          testImage,
          user,
          note,
        );
        await agent
          .delete(`/api/private/notes/${noteId}`)
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
        const fileName = upload.fileUrl.replace('/uploads/', '');
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
        await fs.rmdir(uploadPath);
      });
    });
    it('fails with a forbidden alias', async () => {
      await agent.delete(`/api/private/notes/${forbiddenNoteId}`).expect(400);
    });
    it('fails with a non-existing alias', async () => {
      await agent.delete('/api/private/notes/i_dont_exist').expect(404);
    });
  });

  describe('GET /notes/{note}/revisions', () => {
    it('works with existing alias', async () => {
      await testSetup.notesService.createNote(content, user, 'test4');
      // create a second note to check for a regression, where typeorm always returned
      // all revisions in the database
      await testSetup.notesService.createNote(content, user, 'test4a');
      const response = await agent
        .get('/api/private/notes/test4/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('fails with a forbidden alias', async () => {
      await agent
        .get(`/api/private/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });

    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await agent
        .get('/api/private/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('DELETE /notes/{note}/revisions', () => {
    it('works with an existing alias', async () => {
      const noteId = 'test8';
      const note = await testSetup.notesService.createNote(
        content,
        user,
        noteId,
      );
      await testSetup.notesService.updateNote(note, 'update');
      const responseBeforeDeleting = await agent
        .get('/api/private/notes/test8/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseBeforeDeleting.body).toHaveLength(2);
      await agent
        .delete(`/api/private/notes/${noteId}/revisions`)
        .set('Content-Type', 'application/json')
        .expect(204);
      const responseAfterDeleting = await agent
        .get('/api/private/notes/test8/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfterDeleting.body).toHaveLength(1);
    });
    it('fails with a forbidden alias', async () => {
      await agent
        .delete(`/api/private/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await agent
        .delete('/api/private/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions/{revision-id}', () => {
    it('works with an existing alias', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        user,
        'test5',
      );
      const revision = await testSetup.notesService.getLatestRevision(note);
      const response = await agent
        .get(`/api/private/notes/test5/revisions/${revision.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with a forbidden alias', async () => {
      await agent
        .get(`/api/private/notes/${forbiddenNoteId}/revisions/1`)
        .expect(400);
    });
    it('fails with non-existing alias', async () => {
      // check if a missing note correctly returns 404
      await agent
        .get('/api/private/notes/i_dont_exist/revisions/1')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/media', () => {
    it('works', async () => {
      const alias = 'test6';
      const extraAlias = 'test7';
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
      const response = await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const upload0 = await testSetup.mediaService.saveFile(
        testImage,
        user,
        note1,
      );
      const upload1 = await testSetup.mediaService.saveFile(
        testImage,
        user,
        note2,
      );

      const responseAfter = await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfter.body).toHaveLength(1);
      expect(responseAfter.body[0].url).toEqual(upload0.fileUrl);
      expect(responseAfter.body[0].url).not.toEqual(upload1.fileUrl);
      for (const upload of [upload0, upload1]) {
        const fileName = upload.fileUrl.replace('/uploads/', '');
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
      }
      await fs.rm(uploadPath, { recursive: true });
    });
    it('fails, when note does not exist', async () => {
      await agent
        .get(`/api/private/notes/i_dont_exist/media/`)
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
      await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });
});
