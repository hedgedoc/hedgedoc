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
import { TestSetup, TestSetupBuilder } from '../test-setup';
import { ensureDeleted } from '../utils';

describe('Media', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let agent: request.SuperAgentTest;
  let user: User;

  beforeAll(async () => {
    const username = 'hardcoded';
    const password = 'AHardcodedStrongP@ssword123';
    testSetup = await TestSetupBuilder.create().build();

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
    user = await testSetup.userService.createUser(username, 'Testy');
    await testSetup.identityService.createLocalIdentity(user, password);

    agent = request.agent(testSetup.app.getHttpServer());
    await agent
      .post('/api/private/auth/local/login')
      .send({ username: username, password: password })
      .expect(201);
  });

  afterAll(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  describe('POST /media', () => {
    it('works', async () => {
      const uploadResponse = await agent
        .post('/api/private/media')
        .attach('file', 'test/private-api/fixtures/test.png')
        .set('HedgeDoc-Note', 'test_upload_media')
        .expect('Content-Type', /json/)
        .expect(201);
      const path: string = uploadResponse.body.url;
      const testImage = await fs.readFile('test/private-api/fixtures/test.png');
      const downloadResponse = await agent.get(path);
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
      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  it('DELETE /media/{filename}', async () => {
    const testNote = await testSetup.notesService.createNote(
      'test content',
      null,
      'test_delete_media',
    );
    const testImage = await fs.readFile('test/private-api/fixtures/test.png');
    const upload = await testSetup.mediaService.saveFile(
      testImage,
      user,
      testNote,
    );
    const filename = upload.fileUrl.split('/').pop() || '';
    await agent.delete('/api/private/media/' + filename).expect(204);
  });
});
