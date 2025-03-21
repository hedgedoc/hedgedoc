/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LoginUserInfoDto, ProviderType } from '@hedgedoc/commons';
import { promises as fs } from 'fs';
import request from 'supertest';

import { NotInDBError } from '../../src/errors/errors';
import { Note } from '../../src/notes/note.entity';
import { User } from '../../src/users/user.entity';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Me', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let user: User;
  let content: string;
  let note1: Note;
  let alias2: string;
  let note2: Note;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().build();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
    const username = 'hardcoded';
    const password = 'AHardcodedStrongP@ssword123';
    await testSetup.app.init();

    user = await testSetup.userService.createUser(
      username,
      'Testy',
      null,
      null,
    );
    await testSetup.localIdentityService.createLocalIdentity(user, password);

    content = 'This is a test note.';
    alias2 = 'note2';
    note1 = await testSetup.notesService.createNote(content, user);
    note2 = await testSetup.notesService.createNote(content, user, alias2);
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
    const userInfo = testSetup.userService.toLoginUserInfoDto(
      user,
      ProviderType.LOCAL,
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
    const imageIds = [];
    imageIds.push(
      (
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          user,
          note1,
        )
      ).uuid,
    );
    imageIds.push(
      (
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          user,
          note1,
        )
      ).uuid,
    );
    imageIds.push(
      (
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          user,
          note2,
        )
      ).uuid,
    );
    imageIds.push(
      (
        await testSetup.mediaService.saveFile(
          'test.png',
          testImage,
          user,
          note2,
        )
      ).uuid,
    );

    const response = await agent
      .get('/api/private/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(imageIds).toContain(response.body[0].uuid);
    expect(imageIds).toContain(response.body[1].uuid);
    expect(imageIds).toContain(response.body[2].uuid);
    expect(imageIds).toContain(response.body[3].uuid);
    const mediaUploads = await testSetup.mediaService.listUploadsByUser(user);
    for (const upload of mediaUploads) {
      await testSetup.mediaService.deleteFile(upload);
    }
    await fs.rmdir(uploadPath);
  });

  it('PUT /me/profile', async () => {
    const newDisplayName = 'Another name';
    expect(user.displayName).not.toEqual(newDisplayName);
    await agent
      .put('/api/private/me/profile')
      .send({
        displayName: newDisplayName,
      })
      .expect(200);
    const dbUser = await testSetup.userService.getUserByUsername('hardcoded');
    expect(dbUser.displayName).toEqual(newDisplayName);
  });

  it('DELETE /me', async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const upload = await testSetup.mediaService.saveFile(
      'test.png',
      testImage,
      user,
      note1,
    );
    const dbUser = await testSetup.userService.getUserByUsername('hardcoded');
    expect(dbUser).toBeInstanceOf(User);
    const mediaUploads = await testSetup.mediaService.listUploadsByUser(dbUser);
    expect(mediaUploads).toHaveLength(1);
    expect(mediaUploads[0].uuid).toEqual(upload.uuid);
    await agent.delete('/api/private/me').expect(204);
    await expect(
      testSetup.userService.getUserByUsername('hardcoded'),
    ).rejects.toThrow(NotInDBError);
    const mediaUploadsAfter =
      await testSetup.mediaService.listUploadsByNote(note1);
    expect(mediaUploadsAfter).toHaveLength(0);
  });
});
