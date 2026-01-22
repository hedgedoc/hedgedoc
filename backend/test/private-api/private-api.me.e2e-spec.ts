import { PRIVATE_API_PREFIX } from '../../src/app.module';
import { NotInDBError } from '../../src/errors/errors';
import {
  displayName1,
  displayName2,
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
import { promises as fs } from 'fs';
import request from 'supertest';

describe('Me', () => {
  let testSetup: TestSetup;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let uploadPath: string;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    await testSetup.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] = await setupAgent(testSetup);

    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  describe(`GET ${PRIVATE_API_PREFIX}/me`, () => {
    it('correctly returns your user info', async () => {
      const responseUser1 = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/me`)
        .expect('Content-Type', /json/)
        .expect(200);
      const user1 = responseUser1.body;
      expect(user1.authProvider).toEqual('local');
      expect(user1.displayName).toEqual(displayName1);
      expect(user1.email).toEqual(null);
      expect(user1.username).toEqual(username1);

      const responseUser2 = await agentUser2
        .get(`${PRIVATE_API_PREFIX}/me`)
        .expect('Content-Type', /json/)
        .expect(200);
      const user2 = responseUser2.body;
      expect(user2.authProvider).toEqual('local');
      expect(user2.displayName).toEqual(displayName2);
      expect(user2.email).toEqual(null);
      expect(user2.username).toEqual(username2);
    });
    it('correctly returns info for a guest user', async () => {
      await agentGuestUser
        .get(`${PRIVATE_API_PREFIX}/me`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
    it('does not return info if not logged in', async () => {
      await agentNotLoggedIn
        .get(`${PRIVATE_API_PREFIX}/me`)
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe(`GET ${PRIVATE_API_PREFIX}/me/media`, () => {
    let testImage: Buffer;
    beforeEach(async () => {
      testImage = await fs.readFile('test/public-api/fixtures/test.png');
    });
    afterEach(async () => {
      await fs.rm(uploadPath, { recursive: true, force: true });
    });
    it('correctly returns the media of the owner', async () => {
      const responseBefore = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/me/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(responseBefore.body).toHaveLength(0);

      const imageUuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/me/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].uuid).toEqual(imageUuid);
    });
    it('does not return other users media', async () => {
      const ownImageUuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );

      const otherUsersImageUuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[1],
        testSetup.ownedNoteIds[0],
      );

      const response = await agentUser1
        .get(`${PRIVATE_API_PREFIX}/me/media/`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].uuid).toEqual(ownImageUuid);
      expect(response.body[0].uuid).not.toEqual(otherUsersImageUuid);
    });
  });

  describe(`DELETE ${PRIVATE_API_PREFIX}/me`, () => {
    it('correctly deletes the user', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const userId = testSetup.userIds[0];
      const noteId = testSetup.ownedNoteIds[0];
      const uploadUuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        noteId,
      );
      const mediaUploads = await testSetup.mediaService.getMediaUploadUuidsByUserId(userId);
      expect(mediaUploads).toHaveLength(1);
      expect(mediaUploads[0]).toEqual(uploadUuid);
      await agentUser1.delete(`${PRIVATE_API_PREFIX}/me`).expect(204);
      await expect(testSetup.usersService.getUserDtoByUsername(username1)).rejects.toThrow(
        NotInDBError,
      );
      const mediaUploadsAfter = await testSetup.mediaService.getMediaUploadUuidsByNoteId(noteId);
      expect(mediaUploadsAfter).toHaveLength(0);
      await fs.rmdir(uploadPath);
    });
  });

  describe(`PUT ${PRIVATE_API_PREFIX}/me/profile`, () => {
    it('correctly changes display name', async () => {
      const newDisplayName = 'Another name';
      await agentUser1
        .put(`${PRIVATE_API_PREFIX}/me/profile`)
        .send({
          displayName: newDisplayName,
        })
        .expect(200);
      const dbUser = await testSetup.usersService.getUserDtoByUsername(username1);
      expect(dbUser.displayName).toEqual(newDisplayName);
    });
    it("guest users can't change their display name", async () => {
      const newDisplayName = 'A third name';
      await agentGuestUser
        .put(`${PRIVATE_API_PREFIX}/me/profile`)
        .send({
          displayName: newDisplayName,
        })
        .expect(401);
    });
  });
});
