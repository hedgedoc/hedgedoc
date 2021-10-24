/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import request from 'supertest';

import { AuthConfig } from '../../src/config/auth.config';
import { NotInDBError } from '../../src/errors/errors';
import { Note } from '../../src/notes/note.entity';
import { UserInfoDto } from '../../src/users/user-info.dto';
import { User } from '../../src/users/user.entity';
import { setupSessionMiddleware } from '../../src/utils/session';
import { TestSetup } from '../test-setup';

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
    testSetup = await TestSetup.create();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    const authConfig = testSetup.configService.get('authConfig') as AuthConfig;
    setupSessionMiddleware(testSetup.app, authConfig);
    await testSetup.app.init();

    user = await testSetup.userService.createUser('hardcoded', 'Testy');
    await testSetup.identityService.createLocalIdentity(user, 'test');

    content = 'This is a test note.';
    alias2 = 'note2';
    note1 = await testSetup.notesService.createNote(content, undefined, user);
    note2 = await testSetup.notesService.createNote(content, alias2, user);
    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: 'hardcoded', password: 'test' })
      .expect(201);
  });

  it('GET /me', async () => {
    const userInfo = testSetup.userService.toUserDto(user);
    const response = await agent
      .get('/api/private/me')
      .expect('Content-Type', /json/)
      .expect(200);
    const gotUser = response.body as UserInfoDto;
    expect(gotUser).toEqual(userInfo);
  });

  it('GET /me/media', async () => {
    const responseBefore = await agent
      .get('/api/private/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(responseBefore.body).toHaveLength(0);

    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url0 = await testSetup.mediaService.saveFile(testImage, user, note1);
    const url1 = await testSetup.mediaService.saveFile(testImage, user, note1);
    const url2 = await testSetup.mediaService.saveFile(testImage, user, note2);
    const url3 = await testSetup.mediaService.saveFile(testImage, user, note2);

    const response = await agent
      .get('/api/private/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].url).toEqual(url0);
    expect(response.body[1].url).toEqual(url1);
    expect(response.body[2].url).toEqual(url2);
    expect(response.body[3].url).toEqual(url3);
    const mediaUploads = await testSetup.mediaService.listUploadsByUser(user);
    for (const upload of mediaUploads) {
      await testSetup.mediaService.deleteFile(upload);
    }
    await fs.rmdir(uploadPath);
  });

  it('POST /me/profile', async () => {
    const newDisplayName = 'Another name';
    expect(user.displayName).not.toEqual(newDisplayName);
    await agent
      .post('/api/private/me/profile')
      .send({
        name: newDisplayName,
      })
      .expect(200);
    const dbUser = await testSetup.userService.getUserByUsername('hardcoded');
    expect(dbUser.displayName).toEqual(newDisplayName);
  });

  it('DELETE /me', async () => {
    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url0 = await testSetup.mediaService.saveFile(testImage, user, note1);
    const dbUser = await testSetup.userService.getUserByUsername('hardcoded');
    expect(dbUser).toBeInstanceOf(User);
    const mediaUploads = await testSetup.mediaService.listUploadsByUser(dbUser);
    expect(mediaUploads).toHaveLength(1);
    expect(mediaUploads[0].fileUrl).toEqual(url0);
    await agent.delete('/api/private/me').expect(204);
    await expect(
      testSetup.userService.getUserByUsername('hardcoded'),
    ).rejects.toThrow(NotInDBError);
    const mediaUploadsAfter = await testSetup.mediaService.listUploadsByNote(
      note1,
    );
    expect(mediaUploadsAfter).toHaveLength(0);
  });
});
