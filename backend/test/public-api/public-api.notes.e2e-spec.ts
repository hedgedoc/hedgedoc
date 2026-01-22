import { PUBLIC_API_PREFIX } from '../../src/app.module';
import { NotePermissionsDto } from '../../src/dtos/note-permissions.dto';
import { NotInDBError } from '../../src/errors/errors';
import {
  anonymousNoteAlias1,
  noteAlias1,
  noteAlias2,
  noteAlias4,
  noteContent1,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';
import { ensureDeleted, expectPublicAPIPermissions } from '../utils';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameRevision, SpecialGroup } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

describe('Notes', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let content: string;
  let forbiddenAlias: string;
  let uploadPath: string;
  let testImage: Buffer;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    agent = request.agent(testSetup.app.getHttpServer());
    forbiddenAlias = testSetup.configService.get('noteConfig').forbiddenAliases[0];
    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
    await testSetup.init();
    content = 'This is a test note.';
    testImage = await fs.readFile('test/public-api/fixtures/test.png');
  });

  afterEach(async () => {
    await ensureDeleted(uploadPath);
    await testSetup.cleanup();
  });

  describe(`POST ${PUBLIC_API_PREFIX}/notes`, () => {
    it('creates a new note', async () => {
      const response = await agent
        .post(`${PUBLIC_API_PREFIX}/notes`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata?.primaryAlias).toBeDefined();
      expect(response.body.content).toEqual(content);
    });
    it('errors if token is not provided', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}`, () => {
    it('works with an existing note', async () => {
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('errors with an non-existing note', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors with a forbidden note id', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/forbiddenNoteId`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}`)
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`POST ${PUBLIC_API_PREFIX}/notes/{:newNoteAlias}`, () => {
    const givenAlias = 'testGivenAlias';
    it('creates a note with a non-existing alias', async () => {
      const response = await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${givenAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(201);
      expect(response.body.metadata.primaryAlias).toEqual(givenAlias);
      expect(response.body.content).toEqual(content);
    });

    it('errors with a forbidden alias', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('errors with an existing alias of the user', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });

    it('errors with an existing alias of a different user', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${noteAlias2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });

    it('errors with an existing alias of a guest', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${anonymousNoteAlias1}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(409);
    });

    it('errors with overlong content', async () => {
      const content = 'x'.repeat(
        (testSetup.configService.get('noteConfig').maxLength as number) + 1,
      );
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${givenAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(413);
    });
    it('errors if no token is provided', async () => {
      await agent
        .post(`${PUBLIC_API_PREFIX}/notes/${givenAlias}`)
        .set('Content-Type', 'text/markdown')
        .send(content)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`DELETE ${PUBLIC_API_PREFIX}/notes/{:noteAlias}`, () => {
    describe('deletes a note', () => {
      const deleteNoteAlias = 'deleteTest1';
      it('with an existing alias and keepMedia false', async () => {
        const noteId = await testSetup.notesService.createNote(
          content,
          testSetup.userIds[0],
          deleteNoteAlias,
        );
        await testSetup.mediaService.saveFile('test.png', testImage, testSetup.userIds[0], noteId);
        await agent
          .delete(`${PUBLIC_API_PREFIX}/notes/${deleteNoteAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .send({
            keepMedia: false,
          })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(deleteNoteAlias)).rejects.toEqual(
          new NotInDBError(`Could not find note '${deleteNoteAlias}'`),
        );
        expect(
          await testSetup.mediaService.getMediaUploadUuidsByUserId(testSetup.userIds[0]),
        ).toHaveLength(0);
      });
      it('with an existing alias and keepMedia true', async () => {
        const noteId = await testSetup.notesService.createNote(
          content,
          testSetup.userIds[0],
          deleteNoteAlias,
        );
        const upload = await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          testSetup.userIds[0],
          noteId,
        );
        await agent
          .delete(`${PUBLIC_API_PREFIX}/notes/${deleteNoteAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .send({
            keepMedia: true,
          })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(deleteNoteAlias)).rejects.toEqual(
          new NotInDBError(`Could not find note '${deleteNoteAlias}'`),
        );
        expect(
          await testSetup.mediaService.getMediaUploadUuidsByUserId(testSetup.userIds[0]),
        ).toHaveLength(1);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, upload + '.png'));
      });
      it('with an existing alias with permissions', async () => {
        const noteId = await testSetup.notesService.createNote(
          content,
          testSetup.userIds[0],
          deleteNoteAlias,
        );
        const userId2 = testSetup.userIds[1];
        await testSetup.permissionsService.setUserPermission(noteId, userId2, true);
        await agent
          .delete(`${PUBLIC_API_PREFIX}/notes/${deleteNoteAlias}`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .send({ keepMedia: false })
          .expect(204);
        await expect(testSetup.notesService.getNoteIdByAlias(deleteNoteAlias)).rejects.toEqual(
          new NotInDBError(`Could not find note '${deleteNoteAlias}'`),
        );
      });
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with a non-existing alias', async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/i_dont_exist`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/notes/{:noteAlias}`, () => {
    const changedContent = 'New note text';
    it('changes note content of existing note', async () => {
      const response = await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect(200)
        .expect('Content-Type', /json/);
      expect(response.body.content).toEqual(changedContent);
      expect(
        await testSetup.notesService.getNoteContent(
          await testSetup.notesService.getNoteIdByAlias(noteAlias1),
        ),
      ).toEqual(changedContent);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with a non-existing alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/i_dont_exist`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .set('Content-Type', 'text/markdown')
        .send(changedContent)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/content`, () => {
    it('works with an existing alias', async () => {
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/content`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /markdown/)
        .expect(200);
      expect(response.text).toEqual(noteContent1);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/content`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/content`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/content`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/content`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata`, () => {
    it('returns complete metadata object', async () => {
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.aliases[0]).toEqual(noteAlias1);
      expect(response.body.primaryAlias).toEqual(noteAlias1);
      expect(response.body.title).toEqual('');
      expect(response.body.description).toEqual('');
      expect(typeof response.body.createdAt).toEqual('string');
      expect(response.body.editedBy).toEqual([username1]);
      expect(response.body.permissions.owner).toEqual(username1);
      expect(response.body.permissions.publiclyVisible).toEqual(false);
      expect(response.body.permissions.sharedToUsers).toEqual([]);
      expect(response.body.permissions.sharedToGroups).toEqual([
        {
          groupName: SpecialGroup.EVERYONE,
          canEdit: false,
        },
        {
          groupName: SpecialGroup.LOGGED_IN,
          canEdit: true,
        },
      ]);
      expect(response.body.tags).toEqual([]);
      expect(typeof response.body.updatedAt).toEqual('string');
      expect(typeof response.body.lastUpdatedBy).toEqual('string');
    });

    it('has the correct update/create dates', async () => {
      jest.useFakeTimers({
        legacyFakeTimers: true,
      });
      const noteId = testSetup.ownedNoteIds[0];
      // save the creation time
      const noteMetadata = await testSetup.notesService.toNoteMetadataDto(noteId);
      const createDate = noteMetadata.createdAt;
      const updatedDate = noteMetadata.updatedAt;
      // wait two second
      jest.advanceTimersByTime(2000);
      // update the note
      await testSetup.notesService.updateNote(noteId, 'More test content');
      const metadata = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(metadata.body.createdAt).toEqual(createDate);
      expect(metadata.body.updatedAt).not.toEqual(updatedDate);
      jest.useRealTimers();
    });

    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata`)
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/metadata`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions`, () => {
    it('returns the permissions metadata', async function () {
      const permissions = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(permissions.body.owner).toBe(username1);
      expect(permissions.body.publiclyVisible).toBe(false);
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
    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/metadata/permissions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/users/{:userName}`, () => {
    it('user permissions can be updated', async function () {
      await expectPublicAPIPermissions(
        agent,
        `Bearer ${testSetup.authTokens[0].secret}`,
        noteAlias1,
        username1,
        new Set<NotePermissionsDto['sharedToUsers'][number]>(),
        new Set([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: false,
          },
          {
            canEdit: true,
            groupName: SpecialGroup.LOGGED_IN,
          },
        ]),
      );

      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      await expectPublicAPIPermissions(
        agent,
        `Bearer ${testSetup.authTokens[0].secret}`,
        noteAlias1,
        username1,
        new Set([
          {
            username: username2,
            canEdit: true,
          },
        ]),
        new Set([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: false,
          },
          {
            canEdit: true,
            groupName: SpecialGroup.LOGGED_IN,
          },
        ]),
      );
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`DELETE ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/users/{:userName}`, () => {
    it('deletes user permissions', async () => {
      await testSetup.permissionsService.setUserPermission(
        testSetup.ownedNoteIds[0],
        testSetup.userIds[1],
        true,
      );

      const permissionsDtoBefore = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoBefore.sharedToUsers).toEqual([
        {
          username: username2,
          canEdit: true,
        },
      ]);

      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const permissionsDtoAfter = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoAfter.sharedToUsers).toEqual([]);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/users/${username2}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .delete(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/users/${username2}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/groups/{:groupName}`, () => {
    it('group permissions can be updated', async function () {
      await expectPublicAPIPermissions(
        agent,
        `Bearer ${testSetup.authTokens[0].secret}`,
        noteAlias1,
        username1,
        new Set<NotePermissionsDto['sharedToUsers'][number]>(),
        new Set([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: false,
          },
          {
            canEdit: true,
            groupName: SpecialGroup.LOGGED_IN,
          },
        ]),
      );

      await agent
        .put(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          canEdit: true,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      await expectPublicAPIPermissions(
        agent,
        `Bearer ${testSetup.authTokens[0].secret}`,
        noteAlias1,
        username1,
        new Set<NotePermissionsDto['sharedToUsers'][number]>(),
        new Set([
          {
            groupName: SpecialGroup.EVERYONE,
            canEdit: true,
          },
          {
            canEdit: true,
            groupName: SpecialGroup.LOGGED_IN,
          },
        ]),
      );
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .put(
          `${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .put(
          `${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .put(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .put(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`DELETE ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/groups/{:groupName}`, () => {
    it('deletes group permissions', async () => {
      const permissionsDtoBefore = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoBefore.sharedToGroups).toEqual([
        {
          groupName: SpecialGroup.EVERYONE,
          canEdit: false,
        },
        {
          groupName: SpecialGroup.LOGGED_IN,
          canEdit: true,
        },
      ]);

      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);

      const permissionsDtoAfter = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoAfter.sharedToGroups).toEqual([
        {
          groupName: SpecialGroup.LOGGED_IN,
          canEdit: true,
        },
      ]);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .delete(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/groups/${SpecialGroup.EVERYONE}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/owner`, () => {
    it('changes owner of a note', async () => {
      const permissionsDtoBefore = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoBefore.owner).toEqual(username1);

      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newOwner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const permissionsDtoAfter = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoAfter.owner).toEqual(username2);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/owner`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newOwner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/owner`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newOwner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
        .send({
          newOwner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/owner`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .send({
          newOwner: username2,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`PUT ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/metadata/permissions/visibility`, () => {
    it('changes visibility of a note', async () => {
      const permissionsDtoBefore = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoBefore.publiclyVisible).toEqual(false);

      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newPubliclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      const permissionsDtoAfter = await testSetup.permissionsService.getPermissionsDtoForNote(
        testSetup.ownedNoteIds[0],
      );
      expect(permissionsDtoAfter.publiclyVisible).toEqual(true);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/metadata/permissions/visibility`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newPubliclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/metadata/permissions/visibility`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .send({
          newPubliclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
        .send({
          newPubliclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .put(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/metadata/permissions/visibility`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .send({
          newPubliclyVisible: true,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/revisions`, () => {
    it('works with existing alias', async () => {
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/revisions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
    });

    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/revisions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });

    it('errors with non-existing alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/revisions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/revisions`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/revisions`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/revisions/{:revisionUuid}`, () => {
    it('works with an existing alias', async () => {
      const revision = await testSetup.revisionsService.getLatestRevision(
        testSetup.ownedNoteIds[0],
      );
      const response = await agent
        .get(
          `${PUBLIC_API_PREFIX}/notes/${noteAlias1}/revisions/${revision[FieldNameRevision.uuid]}`,
        )
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body.content).toEqual(noteContent1);
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/revisions/1`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors with non-existing alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/revisions/1`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/revisions/1`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/revisions/1`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/notes/{:noteAlias}/media`, () => {
    it('returns the media for the note', async () => {
      const responseBefore = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseBefore.body).toHaveLength(0);

      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload0 = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      const responseAfter = await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseAfter.body).toHaveLength(1);
      expect(responseAfter.body[0].uuid).toEqual(upload0);
      await fs.unlink(join(uploadPath, upload0 + '.png'));
      await fs.rm(uploadPath, { recursive: true });
    });
    it('errors with a forbidden alias', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${forbiddenAlias}/revisions/1`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it('errors when note does not exist', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/i_dont_exist/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
    it('errors if no token is provided', async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias1}/revisions/1`)
        .set('Content-Type', 'text/markdown')
        .expect('Content-Type', /json/)
        .expect(403);
    });
    it("errors when user can't access note", async () => {
      await agent
        .get(`${PUBLIC_API_PREFIX}/notes/${noteAlias4}/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });
});
