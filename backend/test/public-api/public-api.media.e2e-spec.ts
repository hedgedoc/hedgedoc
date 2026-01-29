import { PUBLIC_API_PREFIX } from '../../src/app.module';
import { MediaUploadDto } from '../../src/dtos/media-upload.dto';
import { ConsoleLoggerService } from '../../src/logger/console-logger.service';
import { getCurrentDateTime, isoStringToDateTime } from '../../src/utils/datetime';
import { noteAlias1, TestSetup, TestSetupBuilder, username1 } from '../test-setup';
import { ensureDeleted } from '../utils';
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { promises as fs } from 'fs';
import { join } from 'path';
import request from 'supertest';

describe('Media', () => {
  let testSetup: TestSetup;
  let agent: request.SuperAgentTest;

  let testImage: Buffer;
  let uploadPath: string;

  beforeEach(async () => {
    testSetup = await TestSetupBuilder.create().withUsers().build();

    testImage = await fs.readFile('test/public-api/fixtures/test.png');
    uploadPath = testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    await testSetup.init();

    agent = request.agent(testSetup.app.getHttpServer());

    const logger = await testSetup.app.resolve(ConsoleLoggerService);
    logger.log('Switching logger', 'AppBootstrap');
    testSetup.app.useLogger(logger);
  });

  afterEach(async () => {
    // Delete the upload folder
    await ensureDeleted(uploadPath);
    await testSetup.cleanup();
  });

  describe(`POST ${PUBLIC_API_PREFIX}/media`, () => {
    it('uploads image', async () => {
      const uploadResponse = await agent
        .post(`${PUBLIC_API_PREFIX}/media`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .attach('file', 'test/public-api/fixtures/test.png')
        .set('HedgeDoc-Note', noteAlias1)
        .expect('Content-Type', /json/)
        .expect(201);
      const uuid = uploadResponse.body.uuid;
      const file = await fs.readFile(join(uploadPath, uuid + '.png'));
      expect(file).toEqual(testImage);
    });
    describe('fails:', () => {
      beforeEach(async () => {
        await ensureDeleted(uploadPath);
      });
      it('MIME type not supported', async () => {
        await agent
          .post(`${PUBLIC_API_PREFIX}/media`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .attach('file', 'test/public-api/fixtures/test.zip')
          .set('HedgeDoc-Note', noteAlias1)
          .expect(400);
        await expect(fs.access(uploadPath)).rejects.toBeDefined();
      });
      it('note does not exist', async () => {
        await agent
          .post(`${PUBLIC_API_PREFIX}/media`)
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
        await agent
          .post(`${PUBLIC_API_PREFIX}/media`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .attach('file', 'test/public-api/fixtures/test.png')
          .set('HedgeDoc-Note', noteAlias1)
          .expect('Content-Type', /json/)
          .expect(500);
      });
      it('no file uploaded', async () => {
        await agent
          .post(`${PUBLIC_API_PREFIX}/media`)
          .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
          .set('HedgeDoc-Note', noteAlias1)
          .expect('Content-Type', /json/)
          .expect(400);
      });

      afterEach(async () => {
        await ensureDeleted(uploadPath);
      });
    });
  });

  describe(`GET ${PUBLIC_API_PREFIX}/media/{:uuid}`, () => {
    const fileName = 'test.png';
    it('returns the media info', async () => {
      jest.useFakeTimers({
        legacyFakeTimers: true,
      });
      const hardCodedNow = getCurrentDateTime();
      const uuid = await testSetup.mediaService.saveFile(
        fileName,
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );
      const response = await agent
        .get(`${PUBLIC_API_PREFIX}/media/${uuid}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const mediaDto: MediaUploadDto = response.body;
      expect(mediaDto.uuid).toEqual(uuid);
      expect(
        isoStringToDateTime(mediaDto.createdAt).toMillis() - hardCodedNow.toMillis(),
      ).toBeLessThan(100);
      expect(mediaDto.noteAlias).toEqual(noteAlias1);
      expect(mediaDto.fileName).toEqual(fileName);
      expect(mediaDto.username).toEqual(username1);
      jest.useRealTimers();
    });
  });

  describe(`DELETE ${PUBLIC_API_PREFIX}/media/{:uuid}`, () => {
    it('successfully deletes an uploaded file', async () => {
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${upload}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);
    });
    it('deleting user is owner of file', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        testSetup.userIds[2],
        'test_delete_media_file',
      );
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testNote,
      );

      // try to delete upload with second user
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${upload}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);

      await agent
        .get(`/uploads/${upload}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(200);

      // delete upload for real
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${upload}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[0].secret}`)
        .expect(204);

      // Test if file is really deleted
      await agent
        .get(`/uploads/${upload}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(404);
    });
    it('deleting user is owner of note', async () => {
      // upload a file with the default test user
      const testNote = await testSetup.notesService.createNote(
        'test content',
        testSetup.userIds[2],
        'test_delete_media_note',
      );
      const upload = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testNote,
      );

      // try to delete upload with second user
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${upload}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);

      await agent
        .get(`/uploads/${upload}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(200);

      // delete upload for real
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${upload}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[2].secret}`)
        .expect(204);

      // Test if file is really deleted
      await agent
        .get(`/uploads/${upload}.png`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(404);
    });
    it('errors if the user does not own the file', async () => {
      const uuid = await testSetup.mediaService.saveFile(
        'test.png',
        testImage,
        testSetup.userIds[0],
        testSetup.ownedNoteIds[0],
      );
      await agent
        .delete(`${PUBLIC_API_PREFIX}/media/${uuid}`)
        .set('Authorization', `Bearer ${testSetup.authTokens[1].secret}`)
        .expect(403);
    });
  });
});
