/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import { User } from 'src/users/user.entity';
import request from 'supertest';

import { ConsoleLoggerService } from '../../src/logger/console-logger.service';
import {
  password1,
  password2,
  TestSetup,
  TestSetupBuilder,
  username1,
  username2,
} from '../test-setup';
import { ensureDeleted } from '../utils';

describe('Media', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let agent: request.SuperAgentTest;
  let user: User;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    testSetup.app.useStaticAssets(uploadPath, {
      prefix: '/uploads',
    });
    await testSetup.app.init();

    const logger = await testSetup.app.resolve(ConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    testSetup.app.useLogger(logger);

    await testSetup.notesService.createNote(
      'test content',
      null,
      'test_upload_media',
    );
    user = testSetup.users[0];

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username1, password: password1 })
      .expect(201);
  });

  afterAll(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe('POST /media', () => {
    describe('works', () => {
      it('with user', async () => {
        const uploadResponse = await agent
          .post('/api/private/media')
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect('Content-Type', /json/)
          .expect(201);
        const fileName: string = uploadResponse.body.id;
        const testImage = await fs.readFile(
          'test/private-api/fixtures/test.png',
        );
        const path = '/api/private/media/' + fileName;
        const apiResponse = await agent.get(path);
        expect(apiResponse.statusCode).toEqual(302);
        const downloadResponse = await agent.get(apiResponse.header.location);
        expect(downloadResponse.body).toEqual(testImage);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
      });
      it('without user', async () => {
        const agent = request.agent(testSetup.app.getHttpServer());
        const uploadResponse = await agent
          .post('/api/private/media')
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect('Content-Type', /json/)
          .expect(201);
        const fileName: string = uploadResponse.body.id;
        const testImage = await fs.readFile(
          'test/private-api/fixtures/test.png',
        );
        const path = '/api/private/media/' + fileName;
        const apiResponse = await agent.get(path);
        expect(apiResponse.statusCode).toEqual(302);
        const downloadResponse = await agent.get(apiResponse.header.location);
        expect(downloadResponse.body).toEqual(testImage);
        // delete the file afterwards
        await fs.unlink(join(uploadPath, fileName));
      });
    });
    describe('fails:', () => {
      beforeEach(async () => {
        await ensureDeleted(uploadPath);
      });
      it('MIME type not supported', async () => {
        await agent
          .post('/api/private/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await agent
          .post('/api/private/media')
          .attach('file', 'test/private-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(404);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('mediaBackend error', async () => {
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await agent
          .post('/api/private/media')
          .attach('file', 'test/private-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect('Content-Type', /json/)
          .expect(500);
      });
      it('no media uploaded', async () => {
        await agent
          .post('/api/private/media')
          .set('HedgeDoc-Note', 'test_upload_media')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  describe('DELETE /media/{filename}', () => {
    it('deleting user is owner of file', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        null,
        'test_delete_media_file',
      );
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        testImage,
        user,
        testNote,
      );
      const filename = upload.id;

      // login with a different user;
      const agent2 = request.agent(testSetup.app.getHttpServer());
      await agent2
        .post('/api/private/auth/local/login')
        .send({ username: username2, password: password2 })
        .expect(201);

      // try to delete upload with second user
      await agent2.delete('/api/private/media/' + filename).expect(403);

      await agent.get('/uploads/' + filename).expect(200);

      // delete upload for real
      await agent.delete('/api/private/media/' + filename).expect(204);

      // Test if file is really deleted
      await agent.get('/uploads/' + filename).expect(404);
    });
    it('deleting user is owner of note', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        await testSetup.userService.getUserByUsername(username2),
        'test_delete_media_note',
      );
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        testImage,
        null,
        testNote,
      );
      const filename = upload.fileUrl.split('/').pop() || '';

      // login with a different user;
      const agent2 = request.agent(testSetup.app.getHttpServer());
      await agent2
        .post('/api/private/auth/local/login')
        .send({ username: username2, password: password2 })
        .expect(201);

      const agentGuest = request.agent(testSetup.app.getHttpServer());

      // try to delete upload with second user
      await agent.delete('/api/private/media/' + filename).expect(403);

      await agent.get('/uploads/' + filename).expect(200);

      await agentGuest.delete('/api/private/media/' + filename).expect(401);

      await agent.get('/uploads/' + filename).expect(200);
      // delete upload for real
      await agent2.delete('/api/private/media/' + filename).expect(204);

      // Test if file is really deleted
      await agent.get('/uploads/' + filename).expect(404);
    });
  });
});
