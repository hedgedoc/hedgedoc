import { PUBLIC_API_PREFIX } from '../../src/app.module';
import { NoteMetadataDto } from '../../src/dtos/note-metadata.dto';
import {
  displayName1,
  noteAlias1,
  noteAlias4,
  TestSetup,
  TestSetupBuilder,
  username1,
} from '../test-setup';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType, FieldNameUser } from '@hedgedoc/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

describe('Me', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let uploadPath: string;
  let userId: number;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().withNotes().build();
    agent = request.agent(testSetup.app.getHttpServer());
    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;
    await testSetup.app.init();
    userId = testSetup.userIds[0];
  });

  afterEach(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });
  describe(`GET ${PUBLIC_API_PREFIX}/me`, () => {
    it('return user info', async () => {
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/me`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toEqual({
        username: username1,
        displayName: displayName1,
        photoUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+E8T8ABu4CpDyuE+YAAAAASUVORK5CYII=',
        authProvider: AuthProviderType.TOKEN,
        email: null,
      });
    });
    it('errors if no token is provided', async () => {
      await agent.get(`${PUBLIC_API_PREFIX}/me`).expect('Content-Type', /json/).expect(403);
    });
  });
  describe(`GET ${PUBLIC_API_PREFIX}/me/notes`, () => {
    it(`returns all notes`, async () => {
      const user = await testSetup.usersService.getUserById(userId);
      const response = await request(testSetup.app.getHttpServer())
        .get('/api/v2/me/notes/')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const noteMetaDtos = response.body as NoteMetadataDto[];
      expect(noteMetaDtos).toHaveLength(2);
      expect(noteMetaDtos[0].primaryAlias).toEqual(noteAlias1);
      expect(noteMetaDtos[0].lastUpdatedBy).toEqual(user[FieldNameUser.username]);
      expect(noteMetaDtos[1].primaryAlias).toEqual(noteAlias4);
      expect(noteMetaDtos[1].lastUpdatedBy).toEqual(user[FieldNameUser.username]);
    });
    it('errors if no token is provided', async () => {
      await agent.get(`${PUBLIC_API_PREFIX}/me/notes`).expect('Content-Type', /json/).expect(403);
    });
  });
  describe(`GET ${PUBLIC_API_PREFIX}/me/media`, () => {
    let newNoteId1: number;
    const imageIds = [];
    beforeEach(async () => {
      newNoteId1 = await testSetup.notesService.getNoteIdByAlias(noteAlias1);
    });
    it('return the images the user has uploaded', async () => {
      const response1 = await agent
        .get(`${PUBLIC_API_PREFIX}/me/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response1.body).toHaveLength(0);

      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      imageIds.push(
        await testSetup.mediaService.saveFile('test.png', testImage, userId, newNoteId1),
      );
      imageIds.push(
        await testSetup.mediaService.saveFile('test.png', testImage, userId, newNoteId1),
      );

      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/me/media/`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(response.body).toHaveLength(2);
      expect(imageIds).toContain(response.body[0].uuid);
      expect(imageIds).toContain(response.body[1].uuid);

      for (const imageId of imageIds) {
        // delete the file afterward
        await fs.unlink(join(uploadPath, imageId + '.png'));
      }
      await fs.rm(uploadPath, { recursive: true });
    });
    it('errors if no token is provided', async () => {
      await agent.get(`${PUBLIC_API_PREFIX}/me/media/`).expect('Content-Type', /json/).expect(403);
    });
  });
});
