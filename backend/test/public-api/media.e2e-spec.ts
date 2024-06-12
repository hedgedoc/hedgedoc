/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

import { ConsoleLoggerService } from '../../src/logger/console-logger.service';
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { ensureDeleted } from '../utils';

describe('Media', () => {
  let testSetup: TestSetup;
  let uploadPath: string;

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
  });

  afterAll(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe('POST /media', () => {
    it('works', async () => {
      const agent = request.agent(testSetup.app.getHttpServer());
      const uploadResponse = await agent
        .post('/api/v2/media')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .attach('file', 'test/public-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'testAlias1')
        .expect('Content-Type', /json/)
        .expect(201);
      const uuid = uploadResponse.body.uuid;
      const path: string = '/api/v2/media/' + uuid;
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const apiResponse = await agent
        .get(path)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`);
      expect(apiResponse.statusCode).toEqual(200);
      const downloadResponse = await agent.get(`/uploads/${uuid}.png`);
      expect(downloadResponse.body).toEqual(testImage);
      // delete the file afterwards
      await fs.unlink(join(uploadPath, uuid + '.png'));
    });
    describe('fails:', () => {
      beforeEach(async () => {
        await ensureDeleted(uploadPath);
      });
      it('MIME type not supported', async () => {
        await request(testSetup.app.getHttpServer())
          .post('/api/v2/media')
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .attach('file', 'test/public-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'testAlias1')
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await request(testSetup.app.getHttpServer())
          .post('/api/v2/media')
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .attach('file', 'test/public-api/fixtures/test.zip')
          .set('HedgeDoc-Note', 'i_dont_exist')
          .expect(404);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('mediaBackend error', async () => {
        await fs.mkdir(uploadPath, {
          mode: '444',
        });
        await request(testSetup.app.getHttpServer())
          .post('/api/v2/media')
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .attach('file', 'test/public-api/fixtures/test.png')
          .set('HedgeDoc-Note', 'testAlias1')
          .expect('Content-Type', /json/)
          .expect(500);
      });
      it('no file uploaded', async () => {
        await request(testSetup.app.getHttpServer())
          .post('/api/v2/media')
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('HedgeDoc-Note', 'testAlias1')
          .expect('Content-Type', /json/)
          .expect(400);
      });

      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  describe('DELETE /media/{filename}', () => {
    it('successfully deletes an uploaded file', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        testSetup.ownedNotes[0],
      );
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);
    });
    it('returns an error if the user does not own the file', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        testSetup.ownedNotes[0],
      );
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);
    });
    it('deleting user is owner of file', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        null,
        'test_delete_media_file',
      );
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        testNote,
      );

      const agent2 = request.agent(testSetup.app.getHttpServer());

      // try to delete upload with second user
      await agent2
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);

      await agent2
        .get(`/uploads/${upload.uuid}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(200);

      // delete upload for real
      await agent2
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      // Test if file is really deleted
      await agent2
        .get(`/uploads/${upload.uuid}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(404);
    });
    it('deleting user is owner of note', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        testSetup.users[2],
        'test_delete_media_note',
      );
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.users[0],
        testNote,
      );

      const agent2 = request.agent(testSetup.app.getHttpServer());
      // try to delete upload with second user
      await agent2
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);

      await agent2
        .get(`/uploads/${upload.uuid}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(200);

      // delete upload for real
      await agent2
        .delete('/api/v2/media/' + upload.uuid)
        .set('Authorization', `Bearer ${testSetup.authTokens[2].secret}`)
        .expect(204);

      // Test if file is really deleted
      await agent2
        .get(`/uploads/${upload.uuid}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(404);
    });
  });
});
