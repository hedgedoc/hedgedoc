/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { noteAlias1, TestSetup, TestSetupBuilder } from '../test-setup';
import { ensureDeleted } from '../utils';
import { setupAgent } from './utils/setup-agent';

describe('Media', () => {
  let testSetup: TestSetup;

  let uploadPath: string;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let userId: number;
  let testImage: Buffer;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    testSetup.app.useStaticAssets(uploadPath, {
      prefix: '/uploads',
    });

    await testSetup.app.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] =
      await setupAgent(testSetup);

    userId = testSetup.userIds[0];
    testImage = await fs.readFile('test/private-api/fixtures/test.png');
  });

  afterEach(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.app.close();
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
        uuid = uploadResponse.text;
        const apiResponse = await agentUser1.get(
          `${PRIVATE_API_PREFIX}/media/${uuid}`,
        );
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
        uuid = uploadResponse.text;
        const apiResponse = await agentGuestUser.get(
          `${PRIVATE_API_PREFIX}/media/${uuid}`,
        );
        expect(apiResponse.statusCode).toEqual(200);
        const downloadResponse = await agentGuestUser.get(
          `/uploads/${uuid}.png`,
        );
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

  describe(`DELETE ${PRIVATE_API_PREFIX}/media/:filename`, () => {
    it('allowed if user is owner of file', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        testSetup.ownedNoteIds[0],
      );

      await agentUser1.get(`/uploads/${uuid}.png`).expect(200);

      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/media/${uuid}`)
        .expect(204);

      await agentUser1.get(`/uploads/${uuid}.png`).expect(404);
    });
    it('allowed if user is owner of note', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[1],
        testSetup.ownedNoteIds[0],
      );

      await agentUser1.get(`/uploads/${uuid}.png`).expect(200);

      await agentUser1
        .delete(`${PRIVATE_API_PREFIX}/media/${uuid}`)
        .expect(204);

      await agentUser1.get(`/uploads/${uuid}.png`).expect(404);
    });
    it("other user can't delete", async () => {
      const uuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentUser2
        .delete(`${PRIVATE_API_PREFIX}/media/${uuid}`)
        .expect(403);
    });
    it("guest user can't delete", async () => {
      const uuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      await agentGuestUser
        .delete(`${PRIVATE_API_PREFIX}/media/${uuid}`)
        .expect(403);
    });
  });
});
