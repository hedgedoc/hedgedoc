/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import type request from 'supertest';
import { PRIVATE_API_PREFIX } from '../../src/app.module';
import type { TestSetup } from '../test-setup';
import { noteAlias1, TestSetupBuilder } from '../test-setup';
import { ensureDeleted } from '../utils';
import { setupAgent } from './utils/setup-agent';
import { MediaUploadDto } from '../../src/dtos/media-upload.dto';
import { SpecialGroup } from '@hedgedoc/commons';

type PartialMediaUploadResponse = Pick<MediaUploadDto, 'fileName' | 'linkedNoteCount'>;

describe('Media', () => {
  let testSetup: TestSetup;

  let uploadPath: string;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let userId: number;
  let testImage: Buffer;
  const testFileName = 'test.png';

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();

    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] = await setupAgent(testSetup);

    userId = testSetup.userIds[0];
    testImage = await fs.readFile('test/private-api/fixtures/test.png');
  });

  afterEach(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.cleanup();
  });

  describe(`POST ${PRIVATE_API_PREFIX}/media`, () => {
    describe('works', () => {
      let uuid: string;
      afterEach(async () => {
        await fs.unlink(join(uploadPath, uuid + '.png'));
        await ensureDeleted(uploadPath);
      });
      it('with user', async () => {
        const uploadResponse = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteAlias1)
          .expect(201);
        uuid = uploadResponse.body.uuid;
        const apiResponse = await agentUser1.get(`${PRIVATE_API_PREFIX}/media/${uuid}`);
        expect(apiResponse.statusCode).toEqual(200);
        const downloadResponse = await agentUser1.get(`/uploads/${uuid}.png`);
        expect(downloadResponse.body).toEqual(testImage);
      });
      it('with user and uppercase note alias', async () => {
        const uploadResponse = await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteAlias1.toUpperCase())
          .expect(201);
        uuid = uploadResponse.body.uuid;
        const apiResponse = await agentUser1.get(`${PRIVATE_API_PREFIX}/media/${uuid}`);
        expect(apiResponse.statusCode).toEqual(200);
        const downloadResponse = await agentUser1.get(`/uploads/${uuid}.png`);
        expect(downloadResponse.body).toEqual(testImage);
      });
      it('with guest user', async () => {
        const noteDtoResponse = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/notes`)
          .set('Content-Type', 'text/markdown')
          .send('')
          .expect('Content-Type', /json/)
          .expect(201);
        const uploadResponse = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteDtoResponse.body.metadata.primaryAlias)
          .expect(201);
        uuid = uploadResponse.body.uuid;
        const apiResponse = await agentGuestUser.get(`${PRIVATE_API_PREFIX}/media/${uuid}`);
        expect(apiResponse.statusCode).toEqual(200);
        const downloadResponse = await agentGuestUser.get(`/uploads/${uuid}.png`);
        expect(downloadResponse.body).toEqual(testImage);
      });
      it('with guest user and uppercase note alias', async () => {
        const noteDtoResponse = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/notes`)
          .set('Content-Type', 'text/markdown')
          .send('')
          .expect('Content-Type', /json/)
          .expect(201);
        const uploadResponse = await agentGuestUser
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteDtoResponse.body.metadata.primaryAlias.toUpperCase())
          .expect(201);
        uuid = uploadResponse.body.uuid;
        const apiResponse = await agentGuestUser.get(`${PRIVATE_API_PREFIX}/media/${uuid}`);
        expect(apiResponse.statusCode).toEqual(200);
        const downloadResponse = await agentGuestUser.get(`/uploads/${uuid}.png`);
        expect(downloadResponse.body).toEqual(testImage);
      });
    });

    describe('fails:', () => {
      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
      it('if user is not logged-in', async () => {
        await agentNotLoggedIn
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteAlias1)
          .expect(401);
      });
      it('MIME type not supported', async () => {
        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', noteAlias1)
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(404);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('mediaBackend error', async () => {
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteAlias1)
          .expect('Content-Type', /json/)
          .expect(500);
      });
      it('no media uploaded', async () => {
        await agentUser1
          .post(`${PRIVATE_API_PREFIX}/media`)
          .set('HedgeDoc-Note', noteAlias1)
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/media/:uuid`, () => {
    let mediaUploadUuid: string;
    beforeEach(async () => {
      mediaUploadUuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        userId,
        testSetup.ownedNoteIds[0],
      );
      // Make note non-readable to guests to test access forbidden case
      const specialGroupEveryoneId = await testSetup.groupService.getGroupIdByName(
        SpecialGroup.EVERYONE,
      );
      await testSetup.permissionsService.removeGroupPermission(
        testSetup.ownedNoteIds[0],
        specialGroupEveryoneId,
      );
    });
    it('returns correct data for owner', async () => {
      // agentUser1 is the uploader and therefore owner
      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/media/${mediaUploadUuid}`)
        .expect(200);
      expect(response.headers['content-type']).toContain('application/json');
      const jsonResponse = response.body as PartialMediaUploadResponse;
      expect(jsonResponse.fileName).toEqual(testFileName);
      expect(jsonResponse.linkedNoteCount).toEqual(1);
    });
    it('returns correct data for user with read-access to a linked note', async () => {
      // agentUser2 has read-permission to the note via the logged-in special group
      const response = await agentUser2
        .get(`${PRIVATE_API_PREFIX}/media/${mediaUploadUuid}`)
        .expect(200);
      expect(response.headers['content-type']).toContain('application/json');
      const jsonResponse = response.body as PartialMediaUploadResponse;
      expect(jsonResponse.fileName).toEqual(testFileName);
      expect(jsonResponse.linkedNoteCount).toEqual(1);
    });
    it('rejects with PermissionError for user with no read-access to a linked note', async () => {
      await agentGuestUser.get(`${PRIVATE_API_PREFIX}/media/${mediaUploadUuid}`).expect(403);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/media/:filename`, () => {
    it('allowed if user is owner of file', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        userId,
        testSetup.ownedNoteIds[0],
      );

      await agentUser1.get(`/uploads/${uuid}.png`).expect(200);

      await agentUser1.delete(`${PRIVATE_API_PREFIX}/media/${uuid}`).expect(204);

      await agentUser1.get(`/uploads/${uuid}.png`).expect(404);
    });
    it('allowed if user is owner of note', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[1],
        testSetup.ownedNoteIds[0],
      );

      await agentUser1.get(`/uploads/${uuid}.png`).expect(200);

      await agentUser1.delete(`${PRIVATE_API_PREFIX}/media/${uuid}`).expect(204);

      await agentUser1.get(`/uploads/${uuid}.png`).expect(404);
    });
    it("other user can't delete", async () => {
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentUser2.delete(`${PRIVATE_API_PREFIX}/media/${uuid}`).expect(403);
    });
    it("guest user can't delete", async () => {
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentGuestUser.delete(`${PRIVATE_API_PREFIX}/media/${uuid}`).expect(403);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/media/:uuid/notes/:noteAlias`, () => {
    it('links media to a note by alias', async () => {
      const targetAlias = 'media_link_target';
      const targetNoteId = await testSetup.notesService.createNote(
        'test content',
        testSetup.userIds[0],
        targetAlias,
      );
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/media/${uuid}/notes/${targetAlias.toUpperCase()}`)
        .expect(204);

      const mediaResponse = await agentUser1.get(`${PRIVATE_API_PREFIX}/media/${uuid}`).expect(200);
      expect(mediaResponse.body.linkedNoteCount).toEqual(2);

      const linkedUploads = await testSetup.mediaService.getMediaUploadUuidsByNoteId(targetNoteId);
      expect(linkedUploads).toContain(uuid);
    });

    it('rejects users who are not the uploader', async () => {
      const targetAlias = 'media_link_foreign_uploader';
      await testSetup.notesService.createNote('test content', testSetup.userIds[1], targetAlias);
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentUser2.put(`${PRIVATE_API_PREFIX}/media/${uuid}/notes/${targetAlias}`).expect(403);
    });

    it('returns 404 for unknown note aliases', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        testFileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentUser1.put(`${PRIVATE_API_PREFIX}/media/${uuid}/notes/does_not_exist`).expect(404);
    });
  });
});
