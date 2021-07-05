/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HistoryService } from '../../src/history/history.service';
import { NotesService } from '../../src/notes/notes.service';
import { HistoryEntryUpdateDto } from '../../src/history/history-entry-update.dto';
import { HistoryEntryDto } from '../../src/history/history-entry.dto';
import { UsersService } from '../../src/users/users.service';
import { TokenAuthGuard } from '../../src/auth/token-auth.guard';
import { MockAuthGuard } from '../../src/auth/mock-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicApiModule } from '../../src/api/public/public-api.module';
import { NotesModule } from '../../src/notes/notes.module';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersModule } from '../../src/users/users.module';
import { HistoryModule } from '../../src/history/history.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import { User } from '../../src/users/user.entity';
import { MediaService } from '../../src/media/media.service';
import { MediaModule } from '../../src/media/media.module';
import { promises as fs } from 'fs';
import { NoteMetadataDto } from '../../src/notes/note-metadata.dto';
import { join } from 'path';

// TODO Tests have to be reworked using UserService functions

describe('Me', () => {
  let app: INestApplication;
  let historyService: HistoryService;
  let notesService: NotesService;
  let userService: UsersService;
  let mediaService: MediaService;
  let uploadPath: string;
  let user: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [mediaConfigMock, appConfigMock],
        }),
        PublicApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-me.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
        HistoryModule,
        MediaModule,
      ],
    })
      .overrideGuard(TokenAuthGuard)
      .useClass(MockAuthGuard)
      .compile();
    const config = moduleRef.get<ConfigService>(ConfigService);
    uploadPath = config.get('mediaConfig').backend.filesystem.uploadPath;
    app = moduleRef.createNestApplication();
    notesService = moduleRef.get(NotesService);
    historyService = moduleRef.get(HistoryService);
    userService = moduleRef.get(UsersService);
    mediaService = moduleRef.get(MediaService);
    user = await userService.createUser('hardcoded', 'Testy');
    await app.init();
  });

  it(`GET /me`, async () => {
    const userInfo = userService.toUserDto(user);
    const response = await request(app.getHttpServer())
      .get('/me')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toEqual(userInfo);
  });

  it(`GET /me/history`, async () => {
    const noteName = 'testGetNoteHistory1';
    const note = await notesService.createNote('', noteName);
    const createdHistoryEntry = await historyService.createOrUpdateHistoryEntry(
      note,
      user,
    );
    const response = await request(app.getHttpServer())
      .get('/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    const history = <HistoryEntryDto[]>response.body;
    expect(history.length).toEqual(1);
    const historyDto = historyService.toHistoryEntryDto(createdHistoryEntry);
    for (const historyEntry of history) {
      expect(historyEntry.identifier).toEqual(historyDto.identifier);
      expect(historyEntry.title).toEqual(historyDto.title);
      expect(historyEntry.tags).toEqual(historyDto.tags);
      expect(historyEntry.pinStatus).toEqual(historyDto.pinStatus);
      expect(historyEntry.lastVisited).toEqual(
        historyDto.lastVisited.toISOString(),
      );
    }
  });

  describe(`GET /me/history/{note}`, () => {
    it('works with an existing note', async () => {
      const noteName = 'testGetNoteHistory2';
      const note = await notesService.createNote('', noteName);
      const createdHistoryEntry =
        await historyService.createOrUpdateHistoryEntry(note, user);
      const response = await request(app.getHttpServer())
        .get(`/me/history/${noteName}`)
        .expect('Content-Type', /json/)
        .expect(200);
      const historyEntry = <HistoryEntryDto>response.body;
      const historyEntryDto =
        historyService.toHistoryEntryDto(createdHistoryEntry);
      expect(historyEntry.identifier).toEqual(historyEntryDto.identifier);
      expect(historyEntry.title).toEqual(historyEntryDto.title);
      expect(historyEntry.tags).toEqual(historyEntryDto.tags);
      expect(historyEntry.pinStatus).toEqual(historyEntryDto.pinStatus);
      expect(historyEntry.lastVisited).toEqual(
        historyEntryDto.lastVisited.toISOString(),
      );
    });
    it('fails with a non-existing note', async () => {
      await request(app.getHttpServer())
        .get('/me/history/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`PUT /me/history/{note}`, () => {
    it('works', async () => {
      const noteName = 'testGetNoteHistory3';
      const note = await notesService.createNote('', noteName);
      await historyService.createOrUpdateHistoryEntry(note, user);
      const historyEntryUpdateDto = new HistoryEntryUpdateDto();
      historyEntryUpdateDto.pinStatus = true;
      const response = await request(app.getHttpServer())
        .put('/me/history/' + noteName)
        .send(historyEntryUpdateDto)
        .expect(200);
      const history = await historyService.getEntriesByUser(user);
      const historyEntry: HistoryEntryDto = response.body;
      expect(historyEntry.pinStatus).toEqual(true);
      let theEntry: HistoryEntryDto;
      for (const entry of history) {
        if (entry.note.aliases.find((element) => element.name === noteName)) {
          theEntry = historyService.toHistoryEntryDto(entry);
        }
      }
      expect(theEntry.pinStatus).toEqual(true);
    });
    it('fails with a non-existing note', async () => {
      await request(app.getHttpServer())
        .put('/me/history/i_dont_exist')
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe(`DELETE /me/history/{note}`, () => {
    it('works', async () => {
      const noteName = 'testGetNoteHistory4';
      const note = await notesService.createNote('', noteName);
      await historyService.createOrUpdateHistoryEntry(note, user);
      const response = await request(app.getHttpServer())
        .delete(`/me/history/${noteName}`)
        .expect(204);
      expect(response.body).toEqual({});
      const history = await historyService.getEntriesByUser(user);
      for (const entry of history) {
        if (entry.note.aliases.find((element) => element.name === noteName)) {
          throw new Error('Deleted history entry still in history');
        }
      }
    });
    describe('fails', () => {
      it('with a non-existing note', async () => {
        await request(app.getHttpServer())
          .delete('/me/history/i_dont_exist')
          .expect(404);
      });
      it('with a non-existing history entry', async () => {
        const noteName = 'testGetNoteHistory5';
        await notesService.createNote('', noteName);
        await request(app.getHttpServer())
          .delete(`/me/history/${noteName}`)
          .expect(404);
      });
    });
  });

  it(`GET /me/notes/`, async () => {
    const noteName = 'testNote';
    await notesService.createNote('', noteName, user);
    const response = await request(app.getHttpServer())
      .get('/me/notes/')
      .expect('Content-Type', /json/)
      .expect(200);
    const noteMetaDtos = response.body as NoteMetadataDto[];
    expect(noteMetaDtos).toHaveLength(1);
    expect(noteMetaDtos[0].primaryAlias).toEqual(noteName);
    expect(noteMetaDtos[0].updateUser?.userName).toEqual(user.userName);
  });

  it('GET /me/media', async () => {
    const note1 = await notesService.createNote(
      'This is a test note.',
      'test8',
      await userService.getUserByUsername('hardcoded'),
    );
    const note2 = await notesService.createNote(
      'This is a test note.',
      'test9',
      await userService.getUserByUsername('hardcoded'),
    );
    const httpServer = app.getHttpServer();
    const response1 = await request(httpServer)
      .get('/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response1.body).toHaveLength(0);

    const testImage = await fs.readFile('test/public-api/fixtures/test.png');
    const url0 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note1.publicId,
    );
    const url1 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note1.publicId,
    );
    const url2 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note2.publicId,
    );
    const url3 = await mediaService.saveFile(
      testImage,
      'hardcoded',
      note2.publicId,
    );

    const response = await request(httpServer)
      .get('/me/media/')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0].url).toEqual(url0);
    expect(response.body[1].url).toEqual(url1);
    expect(response.body[2].url).toEqual(url2);
    expect(response.body[3].url).toEqual(url3);
    for (const fileUrl of [url0, url1, url2, url3]) {
      const fileName = fileUrl.replace('/uploads/', '');
      // delete the file afterwards
      await fs.unlink(join(uploadPath, fileName));
    }
    await fs.rmdir(uploadPath, { recursive: true });
  });

  afterAll(async () => {
    await app.close();
  });
});
