/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import request from 'supertest';

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

describe('Me', () => {
  let testSetup: TestSetup;

  let agentNotLoggedIn: request.SuperAgentTest;
  let agentGuestUser: request.SuperAgentTest;
  let agentUser1: request.SuperAgentTest;
  let agentUser2: request.SuperAgentTest;

  let uploadPath: string;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    await testSetup.app.init();

    [agentNotLoggedIn, agentGuestUser, agentUser1, agentUser2] =
      await setupAgent(testSetup);

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
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
      const response = await agentGuestUser
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

  /*it(`GET ${PRIVATE_API_PREFIX}/me/media`, async () => {
    const responseBefore = await agentUser1
      .get(`${PRIVATE_API_PREFIX}/me/media/`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(responseBefore.body).toHaveLength(0);

    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const imageUuids = [];
    imageUuids.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        noteId1,
      ),
    );
    imageUuids.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        noteId1,
      ),
    );
    imageUuids.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        noteId2,
      ),
    );
    imageUuids.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        userId,
        noteId2,
      ),
    );

    const response = await agent
      .get(`${PRIVATE_API_PREFIX}/me/media/`)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(imageUuids).toContain(response.body[0].uuid);
    expect(imageUuids).toContain(response.body[1].uuid);
    expect(imageUuids).toContain(response.body[2].uuid);
    expect(imageUuids).toContain(response.body[3].uuid);
    const mediaUploads =
      await testSetup.mediaService.getMediaUploadUuidsByUserId(userId);
    for (const upload of mediaUploads) {
      await testSetup.mediaService.deleteFile(upload);
    }
    await fs.rmdir(uploadPath);
  });

  it(`PUT ${PRIVATE_API_PREFIX}/me/profile`, async () => {
    const newDisplayName = 'Another name';
    expect(user[FieldNameUser.displayName]).not.toEqual(newDisplayName);
    await agent
      .put(`${PRIVATE_API_PREFIX}/me/profile`)
      .send({
        displayName: newDisplayName,
      })
      .expect(200);
    const dbUser =
      await testSetup.usersService.getUserDtoByUsername('hardcoded');
    expect(dbUser.displayName).toEqual(newDisplayName);
  });

  it(`DELETE ${PRIVATE_API_PREFIX}/me`, async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const userId =
      await testSetup.usersService.getUserIdByUsername('hardcoded');
    const uploadUuid = await testSetup.mediaService.saveFile(
      'test.png',
      testImage,
      userId,
      noteId1,
    );
    const mediaUploads =
      await testSetup.mediaService.getMediaUploadUuidsByUserId(userId);
    expect(mediaUploads).toHaveLength(1);
    expect(mediaUploads[0]).toEqual(uploadUuid);
    await agent.delete(`${PRIVATE_API_PREFIX}/me`).expect(204);
    await expect(
      testSetup.usersService.getUserDtoByUsername('hardcoded'),
    ).rejects.toThrow(NotInDBError);
    const mediaUploadsAfter =
      await testSetup.mediaService.getMediaUploadUuidsByNoteId(noteId1);
    expect(mediaUploadsAfter).toHaveLength(0);
  });*/
});
