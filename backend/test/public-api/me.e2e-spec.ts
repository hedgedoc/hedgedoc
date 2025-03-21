/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteMetadataDto } from '@hedgedoc/commons';
import { promises as fs } from 'fs';
import { join } from 'path';
import { HistoryEntryDto } from 'src/history/history-entry.dto';
import request from 'supertest';

import { HistoryEntryUpdateDto } from '../../src/history/history-entry-update.dto';
import { User } from '../../src/users/user.entity';
import { TestSetup, TestSetupBuilder } from '../test-setup';

describe('Me', () => {
  let testSetup: TestSetup;

  let uploadPath: string;
  let user: User;

  beforeAll(async () => {
    testSetup = await TestSetupBuilder.create().withMockAuth().build();

    uploadPath =
      testSetup.configService.get('mediaConfig').backend.filesystem.uploadPath;

    user = await testSetup.userService.createUser(
      'hardcoded',
      'Testy',
      null,
      null,
    );
    await testSetup.app.init();
  });

  afterAll(async () => {
    await testSetup.app.close();
    await testSetup.cleanup();
  });

  it(`GET /me`, async () => {
    const userInfo = testSetup.userService.toFullUserDto(user);
    const response = await request(testSetup.app.getHttpServer())
      .get('/api/v2/me')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(userInfo);
  });

  it(`GET /me/history`, async () => {
    const noteName = 'testGetNoteHistory1';
    const note = await testSetup.notesService.createNote('', null, noteName);
    const createdHistoryEntry =
      await testSetup.historyService.updateHistoryEntryTimestamp(note, user);
    const response = await request(testSetup.app.getHttpServer())
      .get('/api/v2/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    const history: HistoryEntryDto[] = response.body;
    expect(history.length).toEqual(1);
    const historyDto =
      await testSetup.historyService.toHistoryEntryDto(createdHistoryEntry);
    for (const historyEntry of history) {
      expect(historyEntry.identifier).toEqual(historyDto.identifier);
      expect(historyEntry.title).toEqual(historyDto.title);
      expect(historyEntry.tags).toEqual(historyDto.tags);
      expect(historyEntry.pinStatus).toEqual(historyDto.pinStatus);
      expect(historyEntry.lastVisitedAt).toEqual(
        historyDto.lastVisitedAt.toISOString(),
      );
    }
  });

  describe(`GET /me/history/{note}`, () => {
    it('works with an existing note', async () => {
      const noteName = 'testGetNoteHistory2';
      const note = await testSetup.notesService.createNote('', null, noteName);
      const createdHistoryEntry =
        await testSetup.historyService.updateHistoryEntryTimestamp(note, user);
      const response = await request(testSetup.app.getHttpServer())
        .get(`/api/v2/me/history/${noteName}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const historyEntry: HistoryEntryDto = response.body;
      const historyEntryDto =
        await testSetup.historyService.toHistoryEntryDto(createdHistoryEntry);
      expect(historyEntry.identifier).toEqual(historyEntryDto.identifier);
      expect(historyEntry.title).toEqual(historyEntryDto.title);
      expect(historyEntry.tags).toEqual(historyEntryDto.tags);
      expect(historyEntry.pinStatus).toEqual(historyEntryDto.pinStatus);
      expect(historyEntry.lastVisitedAt).toEqual(
        historyEntryDto.lastVisitedAt.toISOString(),
      );
    });
    it('fails with a non-existing note', async () => {
      await request(testSetup.app.getHttpServer())
        .get('/api/v2/me/history/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT /me/history/{note}`, () => {
    it('works', async () => {
      const noteName = 'testGetNoteHistory3';
      const note = await testSetup.notesService.createNote('', null, noteName);
      await testSetup.historyService.updateHistoryEntryTimestamp(note, user);
      const historyEntryUpdateDto = new HistoryEntryUpdateDto();
      historyEntryUpdateDto.pinStatus = true;
      const response = await request(testSetup.app.getHttpServer())
        .put('/api/v2/me/history/' + noteName)
        .send(historyEntryUpdateDto)
        .expect(200);
      const history = await testSetup.historyService.getEntriesByUser(user);
      const historyEntry: HistoryEntryDto = response.body;
      expect(historyEntry.pinStatus).toEqual(true);

      let theEntry: HistoryEntryDto;
      for (const entry of history) {
        if (
          (await (await entry.note).aliases).find(
            (element) => element.name === noteName,
          )
        ) {
          theEntry = await testSetup.historyService.toHistoryEntryDto(entry);
        }
      }
      expect(theEntry.pinStatus).toEqual(true);
    });
    it('fails with a non-existing note', async () => {
      await request(testSetup.app.getHttpServer())
        .put('/api/v2/me/history/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`DELETE /me/history/{note}`, () => {
    it('works', async () => {
      const noteName = 'testGetNoteHistory4';
      const note = await testSetup.notesService.createNote('', null, noteName);
      await testSetup.historyService.updateHistoryEntryTimestamp(note, user);
      const response = await request(testSetup.app.getHttpServer())
        .delete(`/api/v2/me/history/${noteName}`)
        .expect(204);
      expect(response.body).toEqual({});
      const history = await testSetup.historyService.getEntriesByUser(user);
      for (const entry of history) {
        if (
          (await (await entry.note).aliases).find(
            (element) => element.name === noteName,
          )
        ) {
          throw new Error('Deleted history entry still in history');
        }
      }
    });
    describe('fails', () => {
      it('with a non-existing note', async () => {
        await request(testSetup.app.getHttpServer())
          .delete('/api/v2/me/history/i_dont_exist')
          .expect(404);
      });
      it('with a non-existing history entry', async () => {
        const noteName = 'testGetNoteHistory5';
        await testSetup.notesService.createNote('', null, noteName);
        await request(testSetup.app.getHttpServer())
          .delete(`/api/v2/me/history/${noteName}`)
          .expect(404);
      });
    });
  });

  it(`GET /me/notes/`, async () => {
    const noteName = 'testNote';
    await testSetup.notesService.createNote('', user, noteName);
    const response = await request(testSetup.app.getHttpServer())
      .get('/api/v2/me/notes/')
      .expect('Content-Type', /json/)
      .expect(200);
    const noteMetaDtos = response.body as NoteMetadataDto[];
    expect(noteMetaDtos).toHaveLength(1);
    expect(noteMetaDtos[0].primaryAddress).toEqual(noteName);
    expect(noteMetaDtos[0].updateUsername).toEqual(user.username);
  });

  it('GET /me/media', async () => {
    const note1 = await testSetup.notesService.createNote(
      'This is a test note.',
      await testSetup.userService.getUserByUsername('hardcoded'),
      'test8',
    );
    const note2 = await testSetup.notesService.createNote(
      'This is a test note.',
      await testSetup.userService.getUserByUsername('hardcoded'),
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
