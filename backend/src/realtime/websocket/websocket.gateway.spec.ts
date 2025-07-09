/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { FieldNameUser } from '@hedgedoc/database';
import { Optional } from '@mrdrogdrog/optional';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { IncomingMessage } from 'http';
import { Mock } from 'ts-mockery';
import WebSocket from 'ws';

import { AliasService } from '../../alias/alias.service';
import appConfigMock from '../../config/mock/app.config.mock';
import authConfigMock from '../../config/mock/auth.config.mock';
import databaseConfigMock from '../../config/mock/database.config.mock';
import noteConfigMock from '../../config/mock/note.config.mock';
import { mockKnexDb } from '../../database/mock/provider';
import { NotInDBError } from '../../errors/errors';
import { NoteEventMap } from '../../events';
import { GroupsService } from '../../groups/groups.service';
import { LoggerModule } from '../../logger/logger.module';
import { NoteService } from '../../notes/note.service';
import { PermissionService } from '../../permissions/permission.service';
import { RevisionsService } from '../../revisions/revisions.service';
import { SessionService } from '../../sessions/session.service';
import { UsersService } from '../../users/users.service';
import * as websocketConnectionModule from '../realtime-note/realtime-connection';
import { RealtimeConnection } from '../realtime-note/realtime-connection';
import { RealtimeNote } from '../realtime-note/realtime-note';
import { RealtimeNoteStore } from '../realtime-note/realtime-note-store';
import { RealtimeNoteService } from '../realtime-note/realtime-note.service';
import * as extractNoteIdFromRequestUrlModule from './utils/extract-note-id-from-request-url';
import { WebsocketGateway } from './websocket.gateway';

jest.mock('@hedgedoc/commons');

describe('Websocket gateway', () => {
  let gateway: WebsocketGateway;
  let sessionService: SessionService;
  let usersService: UsersService;
  let notesService: NoteService;
  let realtimeNoteService: RealtimeNoteService;
  let permissionsService: PermissionService;
  let mockedWebsocketConnection: RealtimeConnection;
  let mockedWebsocket: WebSocket;
  let mockedWebsocketCloseSpy: jest.SpyInstance;
  let addClientSpy: jest.SpyInstance;

  const mockedValidSessionCookie = 'mockedValidSessionCookie';
  const mockedSessionIdWithUser = 'mockedSessionIdWithUser';
  const mockedValidUrl = 'mockedValidUrl';
  const mockedValidGuestUrl = 'mockedValidGuestUrl';
  const mockedValidNoteAlias = 'mockedValidNoteId';
  const mockedValidNoteId = 20;
  const mockedValidGuestNoteAlias = 'mockedValidGuestNoteId';
  const mockedValidGuestNoteId = 21;

  let sessionExistsForUser = true;
  let noteExistsForNoteId = true;
  let userExistsForUserId = true;
  let userHasReadPermissions = true;

  let knexProvider: Provider;

  beforeEach(async () => {
    [, knexProvider] = mockKnexDb();
    jest.resetAllMocks();
    jest.resetModules();

    sessionExistsForUser = true;
    noteExistsForNoteId = true;
    userExistsForUserId = true;
    userHasReadPermissions = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        knexProvider,
        NoteService,
        AliasService,
        GroupsService,
        RevisionsService,
        RealtimeNoteService,
        UsersService,
        PermissionService,
        SessionService,
        RealtimeNoteStore,
        EventEmitter2<NoteEventMap>,
        SchedulerRegistry,
      ],
      imports: [
        LoggerModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
        }),
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
    sessionService = module.get<SessionService>(SessionService);
    usersService = module.get<UsersService>(UsersService);
    notesService = module.get<NoteService>(NoteService);
    realtimeNoteService = module.get<RealtimeNoteService>(RealtimeNoteService);
    permissionsService = module.get<PermissionService>(PermissionService);

    jest
      .spyOn(sessionService, 'extractSessionIdFromRequest')
      .mockImplementation(
        (request: IncomingMessage): Optional<string> =>
          Optional.ofNullable(
            request.headers?.cookie === mockedValidSessionCookie
              ? mockedSessionIdWithUser
              : null,
          ),
      );

    const mockUsername = 'Testy';
    const mockUserId = 42;
    const mockAuthorStyle = 1;
    const mockDisplayName = 'Testy McTestface';

    jest
      .spyOn(sessionService, 'getUserIdForSessionId')
      .mockImplementation((sessionId: string) =>
        sessionExistsForUser && sessionId === mockedSessionIdWithUser
          ? Promise.resolve(mockUserId)
          : Promise.reject('no user for session id found'),
      );

    jest
      .spyOn(usersService, 'getUserById')
      .mockImplementation((userId: number) => {
        if (userExistsForUserId && userId === mockUserId) {
          return Promise.resolve({
            [FieldNameUser.id]: mockUserId,
            [FieldNameUser.username]: mockUsername,
            [FieldNameUser.displayName]: mockDisplayName,
            [FieldNameUser.authorStyle]: mockAuthorStyle,
            [FieldNameUser.email]: null,
            [FieldNameUser.photoUrl]: null,
            [FieldNameUser.guestUuid]: null,
            [FieldNameUser.createdAt]: new Date().toISOString(),
          });
        } else {
          throw new NotInDBError('User not found');
        }
      });

    jest
      .spyOn(
        extractNoteIdFromRequestUrlModule,
        'extractNoteAliasFromRequestUrl',
      )
      .mockImplementation((request: IncomingMessage): string => {
        if (request.url === mockedValidUrl) {
          return mockedValidNoteAlias;
        } else if (request.url === mockedValidGuestUrl) {
          return mockedValidGuestNoteAlias;
        } else {
          throw new Error('no valid note id found');
        }
      });

    jest
      .spyOn(notesService, 'getNoteIdByAlias')
      .mockImplementation((noteAlias: string) => {
        if (noteExistsForNoteId && noteAlias === mockedValidNoteAlias) {
          return Promise.resolve(mockedValidNoteId);
        }
        if (noteAlias === mockedValidGuestNoteAlias) {
          return Promise.resolve(mockedValidGuestNoteId);
        } else {
          return Promise.reject('no note found');
        }
      });

    jest
      .spyOn(permissionsService, 'determinePermission')
      .mockImplementation(
        async (userId: number, noteId: number): Promise<PermissionLevel> =>
          (userId === mockUserId &&
            noteId === mockedValidNoteId &&
            userHasReadPermissions) ||
          (userId === null && noteId === mockedValidGuestNoteId)
            ? PermissionLevel.READ
            : PermissionLevel.DENY,
      );

    const mockedRealtimeNote = Mock.of<RealtimeNote>({
      addClient() {
        //intentionally left blank
      },
    });
    jest
      .spyOn(realtimeNoteService, 'getOrCreateRealtimeNote')
      .mockReturnValue(Promise.resolve(mockedRealtimeNote));

    mockedWebsocketConnection = Mock.of<RealtimeConnection>();
    jest
      .spyOn(websocketConnectionModule, 'RealtimeConnection')
      .mockReturnValue(mockedWebsocketConnection);

    mockedWebsocket = Mock.of<WebSocket>({
      close() {
        //intentionally left blank
      },
    });

    mockedWebsocketCloseSpy = jest.spyOn(mockedWebsocket, 'close');
    addClientSpy = jest.spyOn(mockedRealtimeNote, 'addClient');
  });

  it('adds a valid connection request', async () => {
    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).toHaveBeenCalledWith(mockedWebsocketConnection);
    expect(mockedWebsocketCloseSpy).not.toHaveBeenCalled();
  });

  it('closes the connection if invalid session cookie', async () => {
    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: 'invalid session cookie',
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });

  it("closes the connection if session doesn't exist", async () => {
    sessionExistsForUser = false;

    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });

  it("closes the connection if user doesn't exist for username", async () => {
    userExistsForUserId = false;

    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });

  it("closes the connection if url doesn't contain a valid note id", async () => {
    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: 'invalid url',
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });

  it('closes the connection if url contains an invalid note id', async () => {
    noteExistsForNoteId = false;

    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });

  it('closes the connection if user has no read permissions', async () => {
    userHasReadPermissions = false;

    const request = Mock.of<IncomingMessage>({
      socket: {
        remoteAddress: 'mockHost',
      },
      url: mockedValidUrl,
      headers: {
        cookie: mockedValidSessionCookie,
      },
    });

    await expect(
      gateway.handleConnection(mockedWebsocket, request),
    ).resolves.not.toThrow();
    expect(addClientSpy).not.toHaveBeenCalled();
    expect(mockedWebsocketCloseSpy).toHaveBeenCalled();
  });
});
