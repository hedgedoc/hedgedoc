/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../../src/config/mock/external-services.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { LoggerModule } from '../../src/logger/logger.module';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { HistoryService } from '../../src/history/history.service';
import { Note } from '../../src/notes/note.entity';
import { HistoryEntryImportDto } from '../../src/history/history-entry-import.dto';
import { HistoryEntry } from '../../src/history/history-entry.entity';

describe('History', () => {
  let app: INestApplication;
  let historyService: HistoryService;
  let user: User;
  let note: Note;
  let note2: Note;
  let forbiddenNoteId: string;
  let content: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            mediaConfigMock,
            authConfigMock,
            customizationConfigMock,
            externalServicesConfigMock,
          ],
        }),
        PrivateApiModule,
        NotesModule,
        PermissionsModule,
        GroupsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: './hedgedoc-e2e-private-history.sqlite',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LoggerModule,
        AuthModule,
        UsersModule,
      ],
    }).compile();

    const config = moduleRef.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('appConfig').forbiddenNoteIds[0];
    app = moduleRef.createNestApplication();
    await app.init();
    content = 'This is a test note.';
    historyService = moduleRef.get(HistoryService);
    const userService = moduleRef.get(UsersService);
    user = await userService.createUser('hardcoded', 'Testy');
    const notesService = moduleRef.get(NotesService);
    note = await notesService.createNote(content, null, user);
    note2 = await notesService.createNote(content, 'note2', user);
  });

  it('GET /me/history', async () => {
    const emptyResponse = await request(app.getHttpServer())
      .get('/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(emptyResponse.body.length).toEqual(0);
    const entry = await historyService.createOrUpdateHistoryEntry(note, user);
    const entryDto = historyService.toHistoryEntryDto(entry);
    const response = await request(app.getHttpServer())
      .get('/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.length).toEqual(1);
    expect(response.body[0].identifier).toEqual(entryDto.identifier);
    expect(response.body[0].title).toEqual(entryDto.title);
    expect(response.body[0].tags).toEqual(entryDto.tags);
    expect(response.body[0].pinStatus).toEqual(entryDto.pinStatus);
    expect(response.body[0].lastVisited).toEqual(
      entryDto.lastVisited.toISOString(),
    );
  });

  describe('POST /me/history', () => {
    it('works', async () => {
      expect(await historyService.getEntriesByUser(user)).toHaveLength(1);
      const pinStatus = true;
      const lastVisited = new Date('2020-12-01 12:23:34');
      const postEntryDto = new HistoryEntryImportDto();
      postEntryDto.note = note2.alias;
      postEntryDto.pinStatus = pinStatus;
      postEntryDto.lastVisited = lastVisited;
      await request(app.getHttpServer())
        .post('/me/history')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ history: [postEntryDto] }))
        .expect(201);
      const userEntries = await historyService.getEntriesByUser(user);
      expect(userEntries.length).toEqual(1);
      expect(userEntries[0].note.alias).toEqual(note2.alias);
      expect(userEntries[0].user.userName).toEqual(user.userName);
      expect(userEntries[0].pinStatus).toEqual(pinStatus);
      expect(userEntries[0].updatedAt).toEqual(lastVisited);
    });
    describe('fails', () => {
      let pinStatus: boolean;
      let lastVisited: Date;
      let postEntryDto: HistoryEntryImportDto;
      let prevEntry: HistoryEntry;
      beforeAll(async () => {
        const previousHistory = await historyService.getEntriesByUser(user);
        expect(previousHistory).toHaveLength(1);
        prevEntry = previousHistory[0];
        pinStatus = !previousHistory[0].pinStatus;
        lastVisited = new Date('2020-12-01 23:34:45');
        postEntryDto = new HistoryEntryImportDto();
        postEntryDto.note = note2.alias;
        postEntryDto.pinStatus = pinStatus;
        postEntryDto.lastVisited = lastVisited;
      });
      it('with forbiddenId', async () => {
        const brokenEntryDto = new HistoryEntryImportDto();
        brokenEntryDto.note = forbiddenNoteId;
        brokenEntryDto.pinStatus = pinStatus;
        brokenEntryDto.lastVisited = lastVisited;
        await request(app.getHttpServer())
          .post('/me/history')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({ history: [brokenEntryDto] }))
          .expect(400);
      });
      it('with non-existing note', async () => {
        const brokenEntryDto = new HistoryEntryImportDto();
        brokenEntryDto.note = 'i_dont_exist';
        brokenEntryDto.pinStatus = pinStatus;
        brokenEntryDto.lastVisited = lastVisited;
        await request(app.getHttpServer())
          .post('/me/history')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({ history: [brokenEntryDto] }))
          .expect(400);
      });
      afterEach(async () => {
        const historyEntries = await historyService.getEntriesByUser(user);
        expect(historyEntries).toHaveLength(1);
        expect(historyEntries[0].note.alias).toEqual(prevEntry.note.alias);
        expect(historyEntries[0].user.userName).toEqual(
          prevEntry.user.userName,
        );
        expect(historyEntries[0].pinStatus).toEqual(prevEntry.pinStatus);
        expect(historyEntries[0].updatedAt).toEqual(prevEntry.updatedAt);
      });
    });
  });

  it('DELETE /me/history', async () => {
    expect((await historyService.getEntriesByUser(user)).length).toEqual(1);
    await request(app.getHttpServer()).delete('/me/history').expect(200);
    expect((await historyService.getEntriesByUser(user)).length).toEqual(0);
  });

  it('PUT /me/history/:note', async () => {
    const entry = await historyService.createOrUpdateHistoryEntry(note2, user);
    expect(entry.pinStatus).toBeFalsy();
    await request(app.getHttpServer())
      .put(`/me/history/${entry.note.alias}`)
      .send({ pinStatus: true })
      .expect(200);
    const userEntries = await historyService.getEntriesByUser(user);
    expect(userEntries.length).toEqual(1);
    expect(userEntries[0].pinStatus).toBeTruthy();
    await historyService.deleteHistoryEntry(note2.alias, user);
  });

  it('DELETE /me/history/:note', async () => {
    const entry = await historyService.createOrUpdateHistoryEntry(note2, user);
    const entry2 = await historyService.createOrUpdateHistoryEntry(note, user);
    const entryDto = historyService.toHistoryEntryDto(entry2);
    await request(app.getHttpServer())
      .delete(`/me/history/${entry.note.alias}`)
      .expect(200);
    const userEntries = await historyService.getEntriesByUser(user);
    expect(userEntries.length).toEqual(1);
    const userEntryDto = historyService.toHistoryEntryDto(userEntries[0]);
    expect(userEntryDto.identifier).toEqual(entryDto.identifier);
    expect(userEntryDto.title).toEqual(entryDto.title);
    expect(userEntryDto.tags).toEqual(entryDto.tags);
    expect(userEntryDto.pinStatus).toEqual(entryDto.pinStatus);
    expect(userEntryDto.lastVisited).toEqual(entryDto.lastVisited);
  });

  afterAll(async () => {
    await app.close();
  });
});
