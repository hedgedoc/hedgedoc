/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';

import { PrivateApiModule } from '../../src/api/private/private-api.module';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthConfig } from '../../src/config/auth.config';
import appConfigMock from '../../src/config/mock/app.config.mock';
import authConfigMock from '../../src/config/mock/auth.config.mock';
import customizationConfigMock from '../../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../../src/config/mock/media.config.mock';
import { GroupsModule } from '../../src/groups/groups.module';
import { HistoryEntryImportDto } from '../../src/history/history-entry-import.dto';
import { HistoryEntry } from '../../src/history/history-entry.entity';
import { HistoryService } from '../../src/history/history.service';
import { IdentityService } from '../../src/identity/identity.service';
import { LoggerModule } from '../../src/logger/logger.module';
import { Note } from '../../src/notes/note.entity';
import { NotesModule } from '../../src/notes/notes.module';
import { NotesService } from '../../src/notes/notes.service';
import { PermissionsModule } from '../../src/permissions/permissions.module';
import { User } from '../../src/users/user.entity';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { setupSessionMiddleware } from '../../src/utils/session';

describe('History', () => {
  let app: INestApplication;
  let historyService: HistoryService;
  let identityService: IdentityService;
  let user: User;
  let note: Note;
  let note2: Note;
  let forbiddenNoteId: string;
  let content: string;
  let agent: request.SuperAgentTest;

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
    const authConfig = config.get('authConfig') as AuthConfig;
    setupSessionMiddleware(app, authConfig);
    await app.init();
    content = 'This is a test note.';
    historyService = moduleRef.get(HistoryService);
    const userService = moduleRef.get(UsersService);
    identityService = moduleRef.get(IdentityService);
    user = await userService.createUser('hardcoded', 'Testy');
    await identityService.createLocalIdentity(user, 'test');
    const notesService = moduleRef.get(NotesService);
    note = await notesService.createNote(content, 'note', user);
    note2 = await notesService.createNote(content, 'note2', user);
    agent = request.agent(app.getHttpServer());
    await agent
      .post('/auth/local/login')
      .send({ username: 'hardcoded', password: 'test' })
      .expect(201);
  });

  it('GET /me/history', async () => {
    const emptyResponse = await agent
      .get('/me/history')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(emptyResponse.body.length).toEqual(0);
    const entry = await historyService.updateHistoryEntryTimestamp(note, user);
    const entryDto = historyService.toHistoryEntryDto(entry);
    const response = await agent
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
      postEntryDto.note = note2.aliases.filter(
        (alias) => alias.primary,
      )[0].name;
      postEntryDto.pinStatus = pinStatus;
      postEntryDto.lastVisited = lastVisited;
      await agent
        .post('/me/history')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ history: [postEntryDto] }))
        .expect(201);
      const userEntries = await historyService.getEntriesByUser(user);
      expect(userEntries.length).toEqual(1);
      expect(userEntries[0].note.aliases).toEqual(note2.aliases);
      expect(userEntries[0].user.username).toEqual(user.username);
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
        postEntryDto.note = note2.aliases.filter(
          (alias) => alias.primary,
        )[0].name;
        postEntryDto.pinStatus = pinStatus;
        postEntryDto.lastVisited = lastVisited;
      });
      it('with forbiddenId', async () => {
        const brokenEntryDto = new HistoryEntryImportDto();
        brokenEntryDto.note = forbiddenNoteId;
        brokenEntryDto.pinStatus = pinStatus;
        brokenEntryDto.lastVisited = lastVisited;
        await agent
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
        await agent
          .post('/me/history')
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({ history: [brokenEntryDto] }))
          .expect(400);
      });
      afterEach(async () => {
        const historyEntries = await historyService.getEntriesByUser(user);
        expect(historyEntries).toHaveLength(1);
        expect(historyEntries[0].note.aliases).toEqual(prevEntry.note.aliases);
        expect(historyEntries[0].user.username).toEqual(
          prevEntry.user.username,
        );
        expect(historyEntries[0].pinStatus).toEqual(prevEntry.pinStatus);
        expect(historyEntries[0].updatedAt).toEqual(prevEntry.updatedAt);
      });
    });
  });

  it('DELETE /me/history', async () => {
    expect((await historyService.getEntriesByUser(user)).length).toEqual(1);
    await agent.delete('/me/history').expect(200);
    expect((await historyService.getEntriesByUser(user)).length).toEqual(0);
  });

  it('PUT /me/history/:note', async () => {
    const entry = await historyService.updateHistoryEntryTimestamp(note2, user);
    expect(entry.pinStatus).toBeFalsy();
    const alias = entry.note.aliases.filter((alias) => alias.primary)[0].name;
    await agent
      .put(`/me/history/${alias || 'undefined'}`)
      .send({ pinStatus: true })
      .expect(200);
    const userEntries = await historyService.getEntriesByUser(user);
    expect(userEntries.length).toEqual(1);
    expect(userEntries[0].pinStatus).toBeTruthy();
    await historyService.deleteHistoryEntry(note2, user);
  });

  it('DELETE /me/history/:note', async () => {
    const entry = await historyService.updateHistoryEntryTimestamp(note2, user);
    const alias = entry.note.aliases.filter((alias) => alias.primary)[0].name;
    const entry2 = await historyService.updateHistoryEntryTimestamp(note, user);
    const entryDto = historyService.toHistoryEntryDto(entry2);
    await agent.delete(`/me/history/${alias || 'undefined'}`).expect(200);
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
