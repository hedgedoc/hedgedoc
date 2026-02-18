import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { NoteMetadataDto } from '../../src/dtos/note-metadata.dto';
import { NotInDBError } from '../../src/errors/errors';
import { dateTimeToISOString, dbToDateTime } from '../../src/utils/datetime';
import {
  noteAlias1,
  noteContent1,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';
import { setupAgent } from './utils/setup-agent';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel, PermissionLevelNames } from '@hedgedoc/commons';
import { FieldNameRevision, Revision, SpecialGroup } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { NotePermissionsDto } from '../../src/dtos/note-permissions.dto';
import {response} from "express";

describe('Notes', () => {
  let testSetup: TestSetup;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let forbiddenAlias: string;
  let uploadPath: string;
  let testImage: Buffer;
  const content = 'This is a test note.';

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    await testSetup.init();

    forbiddenAlias = testSetup.configService.get('noteConfig').forbiddenAliases[0];
    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    testImage = await fs.readFile('test/public-api/fixtures/test.png');

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] = await setupAgent(testSetup);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias`, () => {
    it('return the note for the owner', async () => {
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('returns the content for other users with read permission', async () => {
      const response = await agentUser2
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('returns the content for guest users with read permission', async () => {
      const response = await agentGuestUser
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('return the note using a upper case alias', async () => {
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('fails if the user is not logged in', async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
    it('fails for an non-existing note', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('fails for a forbidden note', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias/media`, () => {
    let upload: string;
    async function uploadMedia() {
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );
    }
    describe('return media upload', () => {
      beforeEach(async () => {
        await uploadMedia();
      });
      afterEach(async () => {
        await fs.unlink(join(uploadPath, upload + '.png'));
        await fs.rm(uploadPath, { recursive: true });
      });
      it('for the owner', async () => {
        const responseAfter = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/media/`)
          .expect('Content-Type', /json/)
          .expect(200);
        expect(responseAfter.body).toHaveLength(1);
        expect(responseAfter.body[0].uuid).toEqual(upload);
      });
      it('for another user with read permissions', async () => {
        const responseAfter = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/media/`)
          .expect('Content-Type', /json/)
          .expect(200);
        expect(responseAfter.body).toHaveLength(1);
        expect(responseAfter.body[0].uuid).toEqual(upload);
      });
      it('for a guest user with read permissions', async () => {
        const responseAfter = await agentGuestUser
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/media/`)
          .expect('Content-Type', /json/)
          .expect(200);
        expect(responseAfter.body).toHaveLength(1);
        expect(responseAfter.body[0].uuid).toEqual(upload);
      });
      it('using upper case alias', async () => {
        const responseAfter = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/media/`)
          .expect('Content-Type', /json/)
          .expect(200);
        expect(responseAfter.body).toHaveLength(1);
        expect(responseAfter.body[0].uuid).toEqual(upload);
      });
    });
    describe('throws an error', () => {
      it('if the user is not logged in', async () => {
        await agentNotLoggedIn
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/media/`)
          .expect('Content-Type', /json/)
          .expect(401);
      });
      it("if the user can't read the note", async () => {
        await testSetup.permissionsService.removeGroupPermission(
          testSetup.ownedNoteIds[0],
          await testSetup.groupService.getGroupIdByName(SpecialGroup.EVERYONE),
        );
        await testSetup.permissionsService.removeGroupPermission(
          testSetup.ownedNoteIds[0],
          await testSetup.groupService.getGroupIdByName(SpecialGroup.LOGGED_IN),
        );
        await agentUser2
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/media/`)
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('when the note does not exist', async () => {
        await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/media/`)
          .expect('Content-Type', /json/)
          .expect(404);
      });
      it('fails for a forbidden note', async () => {
        await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/media`)
          .expect('Content-Type', /json/)
          .expect(403);
      });
    });
  });

  describe(`POST ${PRIVATE_API_PREFIX}/notes`, () => {
    describe('a new note can be created by', () => {
      let response: request.Response;
      afterEach(async () => {
        expect(response.body.metadata?.primaryAlias).toBeDefined();
        expect(
          await testSetup.notesService.getNoteContent(
            await testSetup.notesService.getNoteIdByAlias(response.body.metadata.primaryAlias),
          ),
        ).toEqual(content);
      });
      it('a user', async () => {
        response = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/notes`)
          .set('Content-Type', 'text/markdown')
          .send(content)
          .expect('Content-Type', /json/)
          .expect(201);
      });
      it('a guest user', async () => {
        response = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/notes`)
          .set('Content-Type', 'text/markdown')
          .send(content)
          .expect('Content-Type', /json/)
          .expect(201);
      });
    });
    it("a not logged-in user can't create a note", async () => {
      await agentNotLoggedIn
        .post(`${PRIVATE_API_PREFIX}/notes`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(401);
    });
    describe.each([PermissionLevel.DENY, PermissionLevel.READ, PermissionLevel.WRITE])(
      "a guest user can't create a note if maxGuestLevel is",
      (permissionsLevel) => {
        it(`${PermissionLevelNames[permissionsLevel]}`, async () => {
          const noteConfig = testSetup.configService.get('noteConfig');
          noteConfig.permissions.maxGuestLevel = permissionsLevel;
          await agentGuestUser
            .post(`${PRIVATE_API_PREFIX}/notes`)
            .set('Content-Type', 'text/markdown')
            .send(content)
            .expect('Content-Type', /json/)
            .expect(403);
        });
      },
    );
    it('throws an error if trying to create a note with overlong content', async () => {
      const content = 'x'.repeat(
        (testSetup.configService.get('noteConfig').maxLength as number) + 1,
      );
      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes/`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(413);
    });
  });

  describe(`POST ${PRIVATE_API_PREFIX}/notes/:newNoteAlias`, () => {
    const newNoteAlias = 'newNoteAlias';
    describe('a new note can be created by', () => {
      let response: request.Response;
      afterEach(async () => {
        expect(response.body.metadata?.primaryAlias).toEqual(newNoteAlias);
        expect(
          await testSetup.notesService.getNoteContent(
            await testSetup.notesService.getNoteIdByAlias(response.body.metadata.primaryAlias),
          ),
        ).toEqual(content);
      });
      it('a user', async () => {
        response = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias}`)
          .set('Content-Type', 'text/markdown')
          .send(content)
          .expect('Content-Type', /json/)
          .expect(201);
      });
      it('a guest user', async () => {
        response = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias}`)
          .set('Content-Type', 'text/markdown')
          .send(content)
          .expect('Content-Type', /json/)
          .expect(201);
      });
    });
    it('a new note can be created with an upper case alias', async () => {
      const response = await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias.toUpperCase()}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata?.primaryAlias).toEqual(newNoteAlias.toUpperCase());
      expect(
        await testSetup.notesService.getNoteContent(
          await testSetup.notesService.getNoteIdByAlias(response.body.metadata.primaryAlias),
        ),
      ).toEqual(content);
    });
    it("a not logged-in user can't create a note", async () => {
      await agentNotLoggedIn
        .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(401);
    });
    describe.each([PermissionLevel.DENY, PermissionLevel.READ, PermissionLevel.WRITE])(
      "a guest user can't create a note if maxGuestLevel is",
      (permissionsLevel) => {
        it(`${PermissionLevelNames[permissionsLevel]}`, async () => {
          const noteConfig = testSetup.configService.get('noteConfig');
          noteConfig.permissions.maxGuestLevel = permissionsLevel;
          await agentGuestUser
            .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias}`)
            .set('Content-Type', 'text/markdown')
            .send(content)
            .expect('Content-Type', /json/)
            .expect(403);
        });
      },
    );
    it("the note can't be created if the alias is forbiden", async () => {
      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if trying to create a note with an existing aliases', async () => {
      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });
    it('throws an error if trying to create a note with overlong content', async () => {
      const content = 'x'.repeat(
        (testSetup.configService.get('noteConfig').maxLength as number) + 1,
      );
      await agentUser1
        .post(`${PRIVATE_API_PREFIX}/notes/${newNoteAlias}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(413);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/notes/:noteAlias`, () => {
    describe('deletes a note', () => {
      let noteId: number;
      let userId: number;
      beforeEach(() => {
        noteId = testSetup.ownedNoteIds[0];
        userId = testSetup.userIds[0];
      });
      it('with an existing alias and keepMedia false', async () => {
        await testSetup.mediaService.saveFile('test.png', testImage, userId, noteId);
        await agentUser1
          .delete(`/api/private/notes/${noteAlias1}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: false,
          })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(noteAlias1)).rejects.toEqual(
          new NotInDBError(`Could not find note '${noteAlias1}'`),
        );
        expect(await testSetup.mediaService.getMediaUploadUuidsByUserId(userId)).toHaveLength(0);
        await fs.rmdir(uploadPath);
      });
      it('with an existing alias and keepMedia true', async () => {
        const upload = await testSetup.mediaService.saveFile('test.png', testImage, userId, noteId);
        await agentUser1
          .delete(`/api/private/notes/${noteAlias1}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: true,
          })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(noteAlias1)).rejects.toEqual(
          new NotInDBError(`Could not find note '${noteAlias1}'`),
        );
        expect(await testSetup.mediaService.getMediaUploadUuidsByUserId(userId)).toHaveLength(1);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload + '.png'));
        await fs.rmdir(uploadPath);
      });
      it('with an existing alias, but upper case and keepMedia true', async () => {
        const upload = await testSetup.mediaService.saveFile('test.png', testImage, userId, noteId);
        await agentUser1
          .delete(`/api/private/notes/${noteAlias1.toUpperCase()}`)
          .set('Content-Type', 'application/json')
          .send({
            keepMedia: true,
          })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(noteAlias1.toUpperCase())).rejects.toEqual(
          new NotInDBError(`Could not find note '${noteAlias1.toUpperCase()}'`),
        );
        expect(await testSetup.mediaService.getMediaUploadUuidsByUserId(userId)).toHaveLength(1);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload + '.png'));
        await fs.rmdir(uploadPath);
      });
    });
    it('throws an error when trying to delete a forbidden alias', async () => {
      await agentUser1.delete(`/api/private/notes/${forbiddenAlias}`).expect(403);
    });
    it('throws an error when trying to delete a non-existing alias', async () => {
      await agentUser1.delete('/api/private/notes/i_dont_exist').expect(404);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata`, () => {
    describe('returns complete metadata object for', () => {
      let metadataBody: NoteMetadataDto;
      afterEach(() => {
        expect(metadataBody.aliases[0]).toEqual(noteAlias1);
        expect(metadataBody.primaryAlias).toEqual(noteAlias1);
        expect(metadataBody.title).toEqual('');
        expect(metadataBody.description).toEqual('');
        expect(typeof metadataBody.createdAt).toEqual('string');
        expect(metadataBody.editedBy).toEqual([username1]);
        expect(metadataBody.permissions.owner).toEqual(username1);
        expect(metadataBody.permissions.publiclyVisible).toEqual(false);
        expect(metadataBody.permissions.sharedToUsers).toEqual([]);
        expect(metadataBody.permissions.sharedToGroups).toEqual([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: false,
          },
          {
            groupName: SpecialGroup.LOGGED_IN,
            canEdit: true,
          },
        ]);
        expect(metadataBody.tags).toEqual([]);
        expect(typeof metadataBody.updatedAt).toEqual('string');
        expect(typeof metadataBody.lastUpdatedBy).toEqual('string');
        expect(metadataBody.editedBy).toEqual([username1]);
      });
      it('owner', async () => {
        const metadata = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata`)
          .expect('Content-Type', /json/)
          .expect(200);
        metadataBody = metadata.body;
      });
      it('another user', async () => {
        const metadata = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata`)
          .expect('Content-Type', /json/)
          .expect(200);
        metadataBody = metadata.body;
      });
      it('guest user', async () => {
        const metadata = await agentGuestUser
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata`)
          .expect('Content-Type', /json/)
          .expect(200);
        metadataBody = metadata.body;
      });
      it('an upper case alias', async () => {
        const metadata = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/metadata`)
          .expect('Content-Type', /json/)
          .expect(200);
        metadataBody = metadata.body;
      });
    });

    it('throws errors for not logged-in user', async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('throws errors with a forbidden alias', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata`)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('throws errors with non-existing alias', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/metadata`)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('has the correct update/create dates', async () => {
      const noteId = testSetup.ownedNoteIds[0];
      const note = await testSetup.notesService.toNoteMetadataDto(noteId);
      // save the creation time
      const createDate = note.createdAt;
      const revisions = await testSetup.revisionsService.getAllRevisionMetadataDto(noteId);
      const updatedDate = revisions[revisions.length - 1].createdAt;
      // wait one second
      await new Promise((r) => setTimeout(r, 1000));
      // update the note
      await testSetup.notesService.updateNote(noteId, 'More test content');
      const metadata = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(metadata.body.createdAt).toEqual(createDate);
      expect(metadata.body.updatedAt).not.toEqual(updatedDate);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions`, () => {
    describe('returns complete permissions object for', () => {
      let permissionBody: NotePermissionsDto;
      afterEach(() => {
        expect(permissionBody.owner).toEqual(username1);
        expect(permissionBody.publiclyVisible).toEqual(false);
        expect(permissionBody.sharedToUsers).toEqual([]);
        expect(permissionBody.sharedToGroups).toEqual([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: false,
          },
          {
            groupName: SpecialGroup.LOGGED_IN,
            canEdit: true,
          },
        ]);
      });
      it('owner', async () => {
        const metadata = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions`)
          .expect('Content-Type', /json/)
          .expect(200);
        permissionBody = metadata.body;
      });
      it('another user', async () => {
        const metadata = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions`)
          .expect('Content-Type', /json/)
          .expect(200);
        permissionBody = metadata.body;
      });
      it('guest user', async () => {
        const metadata = await agentGuestUser
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions`)
          .expect('Content-Type', /json/)
          .expect(200);
        permissionBody = metadata.body;
      });
      it('an upper case alias', async () => {
        const metadata = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/metadata/permissions`)
          .expect('Content-Type', /json/)
          .expect(200);
        permissionBody = metadata.body;
      });
    });

    it('throws errors for not logged-in user', async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('throws errors with a forbidden alias', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions`)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('throws errors with non-existing alias', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/metadata/permissions`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias/revisions`, () => {
    describe('correctly return list of revisions for', () => {
      let response: request.Response;
      beforeEach(async () => {
        await testSetup.notesService.updateNote(testSetup.ownedNoteIds[0], content);
      });
      afterEach(() => {
        expect(response.body).toHaveLength(2);
        expect(response.body[0].length).toEqual(content.length);
        expect(response.body[1].length).toEqual(noteContent1.length);
      });
      it('the owner', async () => {
        response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('another user', async () => {
        response = await agentUser2
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('a guest user', async () => {
        response = await agentGuestUser
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('an upper case alias', async () => {
        response = await agentUser1
          .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/revisions`)
          .expect('Content-Type', /json/)
          .expect(200);
      });
    });

    it('throws an error if the user is not logged-in user', async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    it('throws an error when using a forbidden alias', async () => {
      await agentUser1.get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/revisions`).expect(403);
    });

    it('throws an error when using a non-existing alias', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/revisions`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/notes/:noteAlias/revisions`, () => {
    describe('if multiple revisions exist', () => {
      let noteId: number;
      beforeEach(async () => {
        noteId = testSetup.ownedNoteIds[0];
        await testSetup.notesService.updateNote(noteId, content);
      });
      it('allows the owner to discard all revisions', async () => {
        await agentUser1.delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`).expect(204);
        const after = await testSetup.revisionsService.getAllRevisionMetadataDto(noteId);
        expect(after).toHaveLength(1);
      });
      it('disallows another user to discard all revisions', async () => {
        await agentUser2
          .delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('disallows guest user to discard all revisions', async () => {
        await agentGuestUser
          .delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('disallows not logged-in user to discard all revisions', async () => {
        await agentNotLoggedIn
          .delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions`)
          .expect('Content-Type', /json/)
          .expect(401);
      });
      it('allows the owner to discard all revisions even via an upper case alias', async () => {
        await agentUser1
          .delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/revisions`)
          .set('Content-Type', 'application/json')
          .expect(204);
        const after = await testSetup.revisionsService.getAllRevisionMetadataDto(noteId);
        expect(after).toHaveLength(1);
      });
    });

    it('throws error if a forbidden alias is requested', async () => {
      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/revisions`)
        .expect(403);
    });
    it('fails with non-existing aliases', async () => {
      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/revisions`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/notes/:noteAlias/revisions/:revisionUuid`, () => {
    let noteId: number;
    let revision: Revision;
    beforeEach(async () => {
      noteId = testSetup.ownedNoteIds[0];
      revision = await testSetup.revisionsService.getLatestRevision(noteId);
    });
    describe('can get the revision by the uuid for', () => {
      let response: request.Response;
      afterEach(() => {
        expect(response.body.content).toEqual(revision.content);
        expect(response.body.createdAt).toEqual(
          dateTimeToISOString(dbToDateTime(revision.created_at)),
        );
        expect(response.body.description).toEqual(revision.description);
        expect(response.body.length).toEqual(revision.content.length);
        expect(response.body.patch).toEqual(revision.patch);
        expect(response.body.title).toEqual(revision.title);
        expect(response.body.uuid).toEqual(revision.uuid);
      });
      it('the owner', async () => {
        response = await agentUser1
          .get(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions/${revision[FieldNameRevision.uuid]}`,
          )
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('another user', async () => {
        response = await agentUser2
          .get(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions/${revision[FieldNameRevision.uuid]}`,
          )
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('guest user', async () => {
        response = await agentGuestUser
          .get(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions/${revision[FieldNameRevision.uuid]}`,
          )
          .expect('Content-Type', /json/)
          .expect(200);
      });
      it('an upper case alias', async () => {
        response = await agentUser1
          .get(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/revisions/${revision[FieldNameRevision.uuid]}`,
          )
          .expect('Content-Type', /json/)
          .expect(200);
      });
    });
    it('throws an error if the user is not logged-in user', async () => {
      await agentNotLoggedIn
        .get(
          `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/revisions/${revision[FieldNameRevision.uuid]}`,
        )
        .expect('Content-Type', /json/)
        .expect(401);
    });
    it('throws an error if the noteAlias is forbidden', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/revisions/1`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if the noteAlias is non-existing', async () => {
      await agentUser1
        .get(`${PRIVATE_API_PREFIX}/notes/i_dont_exist/revisions/1`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/users/:username`, () => {
    describe.each([true, false])('the owner can add new user permissions', (canEdit) => {
      let noteId: number;
      beforeEach(() => {
        noteId = testSetup.ownedNoteIds[0];
      });
      it(`with canEdit ${canEdit}`, async () => {
        await agentUser1
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
          .send({
            canEdit: canEdit,
          })
          .expect('Content-Type', /json/)
          .expect(200);
        const permissions = await testSetup.permissionsService.getPermissionsDtoForNote(noteId);
        expect(permissions.sharedToUsers[0]).toEqual({
          username: username2,
          canEdit: canEdit,
        });
      });
      it(`with canEdit ${canEdit} with upper case alias`, async () => {
        await agentUser1
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1.toUpperCase()}/metadata/permissions/users/${username2}`)
          .send({
            canEdit: canEdit,
          })
          .expect('Content-Type', /json/)
          .expect(200);
        const permissions = await testSetup.permissionsService.getPermissionsDtoForNote(noteId);
        expect(permissions.sharedToUsers[0]).toEqual({
          username: username2,
          canEdit: canEdit,
        });
      });
    });
    describe("can't add user permissions as", () => {
      it('another user', async () => {
        await agentUser2
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/users/${username2}`,
        )
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/users/${username2}`)
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/users/:username`, () => {
    beforeEach(async () => {
      const noteId = testSetup.ownedNoteIds[0];
      const userId = testSetup.userIds[1];
      await testSetup.permissionsService.setUserPermission(noteId, userId, true);
    });
    it('the owner can delete user permissions', async () => {
      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    describe("can't delete user permissions as", () => {
      it('another user', async () => {
        await agentUser2
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`,
          )
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`,
          )
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`,
          )
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/users/${username2}`,
        )
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/users/${username2}`)
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/groups/:groupName`, () => {
    beforeEach(async () => {
      const noteId: number = testSetup.ownedNoteIds[0];
      const groupIdEveryone: number = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.EVERYONE,
      );
      const groupIdLoggedIn: number = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.LOGGED_IN,
      );
      await testSetup.permissionsService.removeGroupPermission(noteId, groupIdEveryone);
      await testSetup.permissionsService.removeGroupPermission(noteId, groupIdLoggedIn);
    });
    describe.each([true, false])('the owner can add new group permissions', (canEdit) => {
      let noteId: number;
      beforeEach(() => {
        noteId = testSetup.ownedNoteIds[0];
      });
      it(`with canEdit ${canEdit}`, async () => {
        await agentUser1
          .put(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .send({
            canEdit: canEdit,
          })
          .expect('Content-Type', /json/)
          .expect(200);
        const permissions = await testSetup.permissionsService.getPermissionsDtoForNote(noteId);
        expect(permissions.sharedToGroups[0]).toEqual({
          groupName: SpecialGroup.EVERYONE,
          canEdit: canEdit,
        });
      });
    });
    describe("can't add group permissions as", () => {
      it('another user', async () => {
        await agentUser2
          .put(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .put(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .put(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .send({
            canEdit: true,
          })
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/groups/:groupName`, () => {
    beforeEach(async () => {
      const noteId = testSetup.ownedNoteIds[0];
      const groupIdLoggedIn: number = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.LOGGED_IN,
      );
      await testSetup.permissionsService.removeGroupPermission(noteId, groupIdLoggedIn);
    });
    it('the owner can delete group permissions', async () => {
      await agentUser1
        .delete(
          `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .expect('Content-Type', /json/)
        .expect(200);
    });
    describe("can't delete group permissions as", () => {
      it('another user', async () => {
        await agentUser2
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .delete(
            `${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
          )
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(
          `${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/owner`, () => {
    it('can change owner as the owner', async () => {
      const response = await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.owner).toEqual(username2);
    });
    describe("can't change owner as", () => {
      it('another user', async () => {
        await agentUser2
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
          .send({
            owner: username2,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
          .send({
            owner: username2,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
          .send({
            owner: username2,
          })
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/owner`)
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/owner`)
        .send({
          owner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/notes/:noteAlias/metadata/permissions/visibility`, () => {
    it('can change visibility as the owner', async () => {
      const response = await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
        .send({
          publiclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.publiclyVisible).toEqual(true);
    });
    describe("can't change visibility as", () => {
      it('another user', async () => {
        await agentUser2
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
          .send({
            publiclyVisible: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('guest user', async () => {
        await agentGuestUser
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
          .send({
            publiclyVisible: true,
          })
          .expect('Content-Type', /json/)
          .expect(403);
      });
      it('not logged-in user', async () => {
        await agentNotLoggedIn
          .put(`${PRIVATE_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
          .send({
            publiclyVisible: true,
          })
          .expect('Content-Type', /json/)
          .expect(401);
      });
    });
    it('throws an error if using a forbidden alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/visibility`)
        .send({
          publiclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('throws an error if using a non-existing alias', async () => {
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/notes/i_do_not_exist/metadata/permissions/visibility`)
        .send({
          publiclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
});
