/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
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
      const uploadResponse = await request(testSetup.app.getHttpServer())
        .post('/api/v2/media')
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .attach('file', 'test/public-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'testAlias1')
        .expect('Content-Type', /json/)
        .expect(201);
      const path: string = uploadResponse.body.url;
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const downloadResponse = await request(testSetup.app.getHttpServer()).get(
        path,
      );
      expect(downloadResponse.body).toEqual(testImage);
      // Remove /uploads/ from path as we just need the filename.
      const fileName = path.replace('/uploads/', '');
      // delete the file afterwards
      await fs.unlink(join(uploadPath, fileName));
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
      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  describe('DELETE /media/{filename}', () => {
    it('successfully deletes an uploaded file', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        testImage,
        testSetup.users[0],
        testSetup.ownedNotes[0],
      );
      const filename = upload.fileUrl.split('/').pop() || '';
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/media/' + filename)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);
    });
    it('returns an error if the user does not own the file', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      const upload = await testSetup.mediaService.saveFile(
        testImage,
        testSetup.users[0],
        testSetup.ownedNotes[0],
      );
      const filename = upload.fileUrl.split('/').pop() || '';
      await request(testSetup.app.getHttpServer())
        .delete('/api/v2/media/' + filename)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);
    });
  });
});
