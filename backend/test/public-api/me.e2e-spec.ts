/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteMetadataDto } from '@hedgedoc/commons';
import { AuthProviderType, FieldNameUser } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Me', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let userId: number;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();
    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
    await testSetup.app.init();
    userId = testSetup.userIds[0];
    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/v2/auth/local/login')
      .send({ username: 'user1', password: 'password1' })
      .expect(201);
  });

  afterAll(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  it('GET /me', async () => {
    const user = await testSetup.usersService.getUserById(userId);
    const userInfo = testSetup.usersService.toLoginUserInfoDto(
      user,
      AuthProviderType.LOCAL,
    );
    const response = await agent
      .get('/api/v2/me')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(userInfo);
  });

  it(`GET /me/notes/`, async () => {
    const noteAlias = 'test-note';
    const user = await testSetup.usersService.getUserById(userId);
    await testSetup.notesService.createNote('', userId, noteAlias);
    const response = await request(testSetup.app.getHttpServer())
      .get('/api/v2/me/notes/')
      .expect('Content-Type', /json/)
      .expect(200);
    const noteMetaDtos = response.body as NoteMetadataDto[];
    expect(noteMetaDtos).toHaveLength(1);
    expect(noteMetaDtos[0].primaryAlias).toEqual(noteAlias);
    expect(noteMetaDtos[0].lastUpdatedBy).toEqual(user[FieldNameUser.username]);
  });

  it('GET /me/media', async () => {
    const note1 = await testSetup.notesService.createNote(
      'This is a test note.',
      testSetup.userIds[0],
      'test8',
    );
    const note2 = await testSetup.notesService.createNote(
      'This is a test note.',
      testSetup.userIds[0],
      'test9',
    );
    const httpServer = testSetup.app.getHttpServer();
    const response1 = await request(httpServer)
      .get('/api/v2/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response1.body).toHaveLength(0);

    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const imageIds = [];
    imageIds.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        note1,
      ),
    );
    imageIds.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        note1,
      ),
    );
    imageIds.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        note2,
      ),
    );
    imageIds.push(
      await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        note2,
      ),
    );

    const response = await request(httpServer)
      .get('/api/v2/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(imageIds).toContain(response.body[0].uuid);
    expect(imageIds).toContain(response.body[1].uuid);
    expect(imageIds).toContain(response.body[2].uuid);
    expect(imageIds).toContain(response.body[3].uuid);
    for (const imageId of imageIds) {
      // delete the file afterwards
      await fs.unlink(join(uploadPath, imageId + '.png'));
    }
    await fs.rm(uploadPath, { recursive: true });
  });
});
