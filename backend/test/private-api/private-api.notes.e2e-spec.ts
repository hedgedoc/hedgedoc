/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameRevision, SpecialGroup } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import {
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';

describe('Notes', () => {
  let testSetup: TestSetup;

  let userId1: number;
  let userId2: number;
  let groupId1: number;
  const groupName1 = 'groupname1';
  const groupName2 = 'groupname2';
  let content: string;
  let forbiddenNoteId: string;
  let uploadPath: string;
  let testImage: Buffer;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withNotes().build();

    forbiddenNoteId =
      testSetup.configService.get('noteConfig').forbiddenNoteIds[0];
    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.app.init();
    const username1 = 'hardcoded';
    const password1 = 'AHardcodedStrongP@ssword123';
    const username2 = 'hardcoded2';
    const password2 = 'AHardcodedStrongP@ssword12';

    userId1 = await testSetup.localIdentityService.createUserWithLocalIdentity(
      username1,
      password1,
      'Testy',
    );
    userId2 = await testSetup.localIdentityService.createUserWithLocalIdentity(
      username2,
      password2,
      'Max Mustermann',
    );

    await testSetup.groupService.createGroup(groupName1, 'Group 1');
    await testSetup.groupService.createGroup(groupName2, 'Group 2');
    groupId1 = await testSetup.groupService.getGroupIdByName(groupName1);

    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username1, password: password1 })
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
        await testSetup.notesService.getNoteIdByAlias(
          response.body.metadata.id,
        ),
      ),
    ).toEqual(content);
  });

  describe('GET /notes/{note}', () => {
    it('works with an existing note', async () => {
      // check if we can succefully get a note that exists
      await testSetup.notesService.createNote(content, userId1, 'test1');
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
    it('works with a non-existing aliases', async () => {
      const response = await agent
        .post('/api/private/notes/test2')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata?.id).toBeDefined();
      return expect(
        await testSetup.notesService.getNoteContent(
          await testSetup.notesService.getNoteIdByAlias(
            response.body.metadata?.id,
          ),
        ),
      ).toEqual(content);
    });

    it('fails with a forbidden aliases', async () => {
      await agent
        .post(`/api/private/notes/${forbiddenNoteId}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with a existing aliases', async () => {
      await agent
        .post('/api/private/notes/test2')
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
      await agent
        .post('/api/private/notes/test3')
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(413);
    });

    it('cannot create an aliases equal to a note publicId', async () => {
      const primaryAlias = await testSetup.aliasService.getPrimaryAliasByNoteId(
        testSetup.anonymousNoteIds[0],
      );
      await agent
        .post(`/api/private/notes/${primaryAlias}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });
  });

  describe('DELETE /notes/{note}', () => {
    describe('works', () => {
      it('with an existing aliases and keepMedia false', async () => {
        const noteId = 'test3';
        const note = await testSetup.notesService.createNote(
          content,
          userId1,
          noteId,
        );
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          userId1,
          note,
        );
        await agent
          .delete(`/api/private/notes/${noteId}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: false,
          })
          .expect(204);
        await expect(
          testSetup.notesService.getNoteIdByAlias(noteId),
        ).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(
          await testSetup.mediaService.getMediaUploadUuidsByUserId(userId1),
        ).toHaveLength(0);
        await fs.rmdir(uploadPath);
      });
      it('with an existing aliases and keepMedia true', async () => {
        const noteId = 'test3a';
        const note = await testSetup.notesService.createNote(
          content,
          userId1,
          noteId,
        );
        const upload = await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          userId1,
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
          testSetup.notesService.getNoteIdByAlias(noteId),
        ).rejects.toEqual(
          new NotInDBError(`Note with id/alias '${noteId}' not found.`),
        );
        expect(
          await testSetup.mediaService.getMediaUploadUuidsByUserId(userId1),
        ).toHaveLength(1);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload + '.png'));
        await fs.rmdir(uploadPath);
      });
    });
    it('fails with a forbidden aliases', async () => {
      await agent.delete(`/api/private/notes/${forbiddenNoteId}`).expect(400);
    });
    it('fails with a non-existing aliases', async () => {
      await agent.delete('/api/private/notes/i_dont_exist').expect(404);
    });
  });

  describe('GET /notes/{note}/metadata', () => {
    it('returns complete metadata object', async () => {
      const noteAlias = 'metadata_test_note';
      await testSetup.notesService.createNote(content, userId1, noteAlias);
      const metadata = await agent
        .get(`/api/private/notes/${noteAlias}/metadata`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(typeof metadata.body.id).toEqual('string');
      expect(metadata.body.aliases[0].name).toEqual(noteAlias);
      expect(metadata.body.primaryAlias).toEqual(noteAlias);
      expect(metadata.body.title).toEqual('');
      expect(metadata.body.description).toEqual('');
      expect(typeof metadata.body.createdAt).toEqual('string');
      expect(metadata.body.editedBy).toEqual([]);
      expect(metadata.body.permissions.owner).toEqual('hardcoded');
      expect(metadata.body.permissions.sharedToUsers).toEqual([]);
      expect(metadata.body.permissions.sharedToGroups).toEqual([]);
      expect(metadata.body.tags).toEqual([]);
      expect(typeof metadata.body.updatedAt).toEqual('string');
      expect(typeof metadata.body.lastUpdatedBy).toEqual('string');
      expect(typeof metadata.body.viewCount).toEqual('number');
      expect(metadata.body.editedBy).toEqual([]);
    });

    it('fails with a forbidden aliases', async () => {
      await agent
        .get(`/api/private/notes/${forbiddenNoteId}/metadata`)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    it('fails with non-existing aliases', async () => {
      // check if a missing note correctly returns 404
      await agent
        .get('/api/private/notes/i_dont_exist/metadata')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      const noteAlias = 'metadata_test_note_date';
      // create a note
      const noteId = await testSetup.notesService.createNote(
        content,
        userId1,
        noteAlias,
      );
      const note = await testSetup.notesService.toNoteMetadataDto(noteId);
      // save the creation time
      const createDate = note.createdAt;
      const revisions =
        await testSetup.revisionsService.getAllRevisionMetadataDto(noteId);
      const updatedDate = revisions[revisions.length - 1].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await testSetup.notesService.updateNote(noteId, 'More test content');
      const metadata = await agent
        .get(`/api/private/notes/${noteAlias}/metadata`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(metadata.body.createdAt).toEqual(createDate);
      expect(metadata.body.updatedAt).not.toEqual(updatedDate);
    });
  });

  describe('GET /notes/{note}/revisions', () => {
    it('works with existing aliases', async () => {
      await testSetup.notesService.createNote(content, userId1, 'test4');
      // create a second note to check for a regression, where typeorm always returned
      // all revisions in the database
      await testSetup.notesService.createNote(content, userId1, 'test4a');
      const response = await agent
        .get('/api/private/notes/test4/revisions')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('fails with a forbidden aliases', async () => {
      await agent
        .get(`/api/private/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });

    it('fails with non-existing aliases', async () => {
      // check if a missing note correctly returns 404
      await agent
        .get('/api/private/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('DELETE /notes/{note}/revisions', () => {
    it('works with an existing aliases', async () => {
      const noteId = 'test8';
      const note = await testSetup.notesService.createNote(
        content,
        userId1,
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
    it('fails with a forbidden aliases', async () => {
      await agent
        .delete(`/api/private/notes/${forbiddenNoteId}/revisions`)
        .expect(400);
    });
    it('fails with non-existing aliases', async () => {
      // check if a missing note correctly returns 404
      await agent
        .delete('/api/private/notes/i_dont_exist/revisions')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('GET /notes/{note}/revisions/{revision-id}', () => {
    it('works with an existing aliases', async () => {
      const note = await testSetup.notesService.createNote(
        content,
        userId1,
        'test5',
      );
      const revision = await testSetup.revisionsService.getLatestRevision(note);
      const response = await agent
        .get(
          `/api/private/notes/test5/revisions/${revision[FieldNameRevision.uuid]}`,
        )
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(content);
    });
    it('fails with a forbidden aliases', async () => {
      await agent
        .get(`/api/private/notes/${forbiddenNoteId}/revisions/1`)
        .expect(400);
    });
    it('fails with non-existing aliases', async () => {
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
        userId1,
        alias,
      );
      const note2 = await testSetup.notesService.createNote(
        content,
        userId1,
        extraAlias,
      );
      const response = await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(0);

      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const upload0 = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId1,
        note1,
      );
      const upload1 = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId1,
        note2,
      );

      const responseAfter = await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfter.body).toHaveLength(1);
      expect(responseAfter.body[0].uuid).toEqual(upload0);
      expect(responseAfter.body[0].uuid).not.toEqual(upload1);
      for (const upload of [upload0, upload1]) {
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload + '.png'));
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
        userId2,
        alias,
      );
      // Redact default read permissions
      const noteId = await testSetup.notesService.getNoteIdByAlias(alias);
      const groupIdEveryone = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.EVERYONE,
      );
      const groupIdLoggedIn = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.LOGGED_IN,
      );
      await testSetup.permissionsService.removeGroupPermission(
        noteId,
        groupIdEveryone,
      );
      await testSetup.permissionsService.removeGroupPermission(
        noteId,
        groupIdLoggedIn,
      );
      await agent
        .get(`/api/private/notes/${alias}/media/`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('permissions', () => {
    const user1NoteAlias = 'user1NoteAlias';
    const user2NoteAlias = 'user2NoteAlias';

    beforeAll(async () => {
      await testSetup.notesService.createNote(
        'This is a test note.',
        userId1,
        user1NoteAlias,
      );
      await testSetup.notesService.createNote(
        'This is a test note.',
        userId2,
        user2NoteAlias,
      );
    });

    describe('users', () => {
      describe('PUT /notes/{note}/metadata/permissions/users/{userName}', () => {
        it('fails, when note does not exist', async () => {
          await agent
            .put(
              `/api/private/notes/notExisting/metadata/permissions/users/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(404);
        });

        it('fails, when user is not the owner', async () => {
          await agent
            .put(
              `/api/private/notes/${user2NoteAlias}/metadata/permissions/users/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(403);
        });

        it("doesn't do anything if the user is the owner", async () => {
          const note =
            await testSetup.notesService.getNoteIdByAlias(user1NoteAlias);
          await testSetup.permissionsService.removeUserPermission(
            note,
            userId2,
          );

          const response = await agent
            .put(
              `/api/private/notes/${user1NoteAlias}/metadata/permissions/users/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ canEdit: true });
          expect(response.body.sharedToUsers).toHaveLength(0);
        });

        it.each([true, false])('works with edit set to %s', async (canEdit) => {
          const response = await agent
            .put(
              `/api/private/notes/${user1NoteAlias}/metadata/permissions/users/${username2}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ canEdit: canEdit });
          expect(response.body.sharedToUsers[0].canEdit).toBe(canEdit);
          expect(response.body.sharedToUsers[0].username).toBe(username2);
        });
      });

      describe('DELETE /notes/{note}/metadata/permissions/users/{userName}', () => {
        it('fails, when note does not exist', async () => {
          await agent
            .delete(
              `/api/private/notes/notExisting/metadata/permissions/users/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(404);
        });

        it('fails, when user is not the owner', async () => {
          await agent
            .delete(
              `/api/private/notes/${user2NoteAlias}/metadata/permissions/users/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(403);
        });

        it('works', async () => {
          const note =
            await testSetup.notesService.getNoteIdByAlias(user1NoteAlias);
          await testSetup.permissionsService.setUserPermission(
            note,
            userId2,
            false,
          );

          const response = await agent
            .delete(
              `/api/private/notes/${user1NoteAlias}/metadata/permissions/users/${username2}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ canEdit: true });
          expect(response.body.sharedToUsers).toHaveLength(0);
        });
      });
    });

    describe('groups', () => {
      describe('PUT /notes/{note}/metadata/permissions/groups/{groupName}', () => {
        it('fails, when note does not exist', async () => {
          await agent
            .put(
              `/api/private/notes/notExisting/metadata/permissions/groups/${username1}`,
            )
            .expect('Content-Type', /json/)
            .expect(404);
        });

        it('fails, when user is not the owner', async () => {
          await agent
            .put(
              `/api/private/notes/${user2NoteAlias}/metadata/permissions/groups/${groupName2}`,
            )
            .expect('Content-Type', /json/)
            .expect(403);
        });

        it.each([true, false])('works with edit set to %s', async (canEdit) => {
          const response = await agent
            .put(
              `/api/private/notes/${user1NoteAlias}/metadata/permissions/groups/${groupName2}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ canEdit: canEdit });
          expect(response.body.sharedToGroups[2].canEdit).toBe(canEdit);
          expect(response.body.sharedToGroups[2].groupName).toBe(groupName2);
        });
      });

      describe('DELETE /notes/{note}/metadata/permissions/groups/{groupName}', () => {
        it('fails, when note does not exist', async () => {
          await agent
            .delete(
              `/api/private/notes/notExisting/metadata/permissions/groups/${groupName2}`,
            )
            .expect('Content-Type', /json/)
            .expect(404);
        });

        it('fails, when user is not the owner', async () => {
          await agent
            .delete(
              `/api/private/notes/${user2NoteAlias}/metadata/permissions/groups/${groupName2}`,
            )
            .expect('Content-Type', /json/)
            .expect(403);
        });

        it('works', async () => {
          const note =
            await testSetup.notesService.getNoteIdByAlias(user1NoteAlias);
          await testSetup.permissionsService.setGroupPermission(
            note,
            groupId1,
            false,
          );

          const response = await agent
            .delete(
              `/api/private/notes/${user1NoteAlias}/metadata/permissions/groups/${groupName2}`,
            )
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ canEdit: true });
          expect(response.body.sharedToGroups).toHaveLength(2);
        });
      });
    });

    describe('owner', () => {
      describe('PUT /notes/{note}/metadata/permissions/owner', () => {
        it('fails, when note does not exist', async () => {
          await agent
            .put(`/api/private/notes/notExisting/metadata/permissions/owner`)
            .expect('Content-Type', /json/)
            .expect(404);
        });

        it('fails, when user is not the owner', async () => {
          await agent
            .put(
              `/api/private/notes/${user2NoteAlias}/metadata/permissions/owner`,
            )
            .expect('Content-Type', /json/)
            .expect(403);
        });

        it('works', async () => {
          const alias = 'noteForNewOwner';
          await testSetup.notesService.createNote(
            "I'll get a new owner!",
            userId1,
            alias,
          );
          const response = await agent
            .put(`/api/private/notes/${alias}/metadata/permissions/owner`)
            .expect('Content-Type', /json/)
            .expect(200)
            .send({ owner: username2 });
          expect(response.body.metadata.permissions.owner).toBe(username2);
        });
      });
    });
  });
});
