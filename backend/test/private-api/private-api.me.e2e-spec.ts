/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType, LoginUserInfoDto } from '@hedgedoc/commons';
import { FieldNameUser, User } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Me', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let user: User;
  let userId: number;
  let content: string;
  let noteId1: number;
  let alias2: string;
  let noteId2: number;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().build();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
    const username = 'hardcoded';
    const password = 'AHardcodedStrongP@ssword123';
    await testSetup.app.init();

    userId = await testSetup.localIdentityService.createUserWithLocalIdentity(
      username,
      password,
      'Testy',
    );
    user = await testSetup.usersService.getUserById(userId);

    content = 'This is a test note.';
    alias2 = 'note2';
    noteId1 = await testSetup.notesService.createNote(content, userId);
    noteId2 = await testSetup.notesService.createNote(content, userId, alias2);
    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username, password: password })
      .expect(201);
  });

  afterAll(async () => {
    await testSetup.cleanup();
  });

  it('GET /me', async () => {
    const userInfo = testSetup.usersService.toLoginUserInfoDto(
      user,
      AuthProviderType.LOCAL,
    );
    const response = await agent
      .get('/api/private/me')
      .expect('Content-Type', /json/)
      .expect(200);
    const gotUser = response.body as LoginUserInfoDto;
    expect(gotUser).toEqual(userInfo);
  });

  it('GET /me/media', async () => {
    const responseBefore = await agent
      .get('/api/private/me/media/')
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
      .get('/api/private/me/media/')
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

  it('PUT /me/profile', async () => {
    const newDisplayName = 'Another name';
    expect(user[FieldNameUser.displayName]).not.toEqual(newDisplayName);
    await agent
      .put('/api/private/me/profile')
      .send({
        displayName: newDisplayName,
      })
      .expect(200);
    const dbUser =
      await testSetup.usersService.getUserDtoByUsername('hardcoded');
    expect(dbUser.displayName).toEqual(newDisplayName);
  });

  it('DELETE /me', async () => {
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
    await agent.delete('/api/private/me').expect(204);
    await expect(
      testSetup.usersService.getUserDtoByUsername('hardcoded'),
    ).rejects.toThrow(NotInDBError);
    const mediaUploadsAfter =
      await testSetup.mediaService.getMediaUploadUuidsByNoteId(noteId1);
    expect(mediaUploadsAfter).toHaveLength(0);
  });
});
