/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IncomingMessage } from 'http';
import { Mock } from 'ts-mockery';
import { Repository } from 'typeorm';
import WebSocket from 'ws';

import { AuthToken } from '../../auth/auth-token.entity';
import { Author } from '../../authors/author.entity';
import appConfigMock from '../../config/mock/app.config.mock';
import authConfigMock from '../../config/mock/auth.config.mock';
import databaseConfigMock from '../../config/mock/database.config.mock';
import noteConfigMock from '../../config/mock/note.config.mock';
import { Group } from '../../groups/group.entity';
import { Identity } from '../../identity/identity.entity';
import { LoggerModule } from '../../logger/logger.module';
import { Alias } from '../../notes/alias.entity';
import { Note } from '../../notes/note.entity';
import { NotesModule } from '../../notes/notes.module';
import { NotesService } from '../../notes/notes.service';
import { Tag } from '../../notes/tag.entity';
import { NoteGroupPermission } from '../../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../../permissions/note-user-permission.entity';
import { PermissionsModule } from '../../permissions/permissions.module';
import { PermissionsService } from '../../permissions/permissions.service';
import { Edit } from '../../revisions/edit.entity';
import { Revision } from '../../revisions/revision.entity';
import { SessionModule } from '../../session/session.module';
import { SessionService } from '../../session/session.service';
import { Session } from '../../users/session.entity';
import { User } from '../../users/user.entity';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { RealtimeNote } from '../realtime-note/realtime-note';
import { RealtimeNoteModule } from '../realtime-note/realtime-note.module';
import { RealtimeNoteService } from '../realtime-note/realtime-note.service';
import * as websocketConnectionModule from '../realtime-note/websocket-connection';
import { WebsocketConnection } from '../realtime-note/websocket-connection';
import * as extractNoteIdFromRequestUrlModule from './utils/extract-note-id-from-request-url';
import { WebsocketGateway } from './websocket.gateway';

import SpyInstance = jest.SpyInstance;

describe('Websocket gateway', () => {
  let gateway: WebsocketGateway;
  let sessionService: SessionService;
  let usersService: UsersService;
  let notesService: NotesService;
  let realtimeNoteService: RealtimeNoteService;
  let permissionsService: PermissionsService;
  let mockedWebsocketConnection: WebsocketConnection;
  let mockedWebsocket: WebSocket;
  let mockedWebsocketCloseSpy: SpyInstance;
  let addClientSpy: SpyInstance;

  const mockedValidSessionCookie = 'mockedValidSessionCookie';
  const mockedSessionIdWithUser = 'mockedSessionIdWithUser';
  const mockedValidUrl = 'mockedValidUrl';
  const mockedValidNoteId = 'mockedValidNoteId';

  let sessionExistsForUser = true;
  let noteExistsForNoteId = true;
  let userExistsForUsername = true;
  let userHasReadPermissions = true;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

    sessionExistsForUser = true;
    noteExistsForNoteId = true;
    userExistsForUsername = true;
    userHasReadPermissions = true;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: getRepositoryToken(Note),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Group),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
      imports: [
        LoggerModule,
        NotesModule,
        PermissionsModule,
        RealtimeNoteModule,
        UsersModule,
        SessionModule,
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
    })
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .overrideProvider(getRepositoryToken(Alias))
      .useValue({})
      .compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
    sessionService = module.get<SessionService>(SessionService);
    usersService = module.get<UsersService>(UsersService);
    notesService = module.get<NotesService>(NotesService);
    realtimeNoteService = module.get<RealtimeNoteService>(RealtimeNoteService);
    permissionsService = module.get<PermissionsService>(PermissionsService);

    jest
      .spyOn(sessionService, 'extractVerifiedSessionIdFromRequest')
      .mockImplementation((request: IncomingMessage): string => {
        if (request.headers.cookie === mockedValidSessionCookie) {
          return mockedSessionIdWithUser;
        } else {
          throw new Error('no valid session cookie found');
        }
      });

    const mockUsername = 'mockUsername';
    jest
      .spyOn(sessionService, 'fetchUsernameForSessionId')
      .mockImplementation((sessionId: string) =>
        sessionExistsForUser && sessionId === mockedSessionIdWithUser
          ? Promise.resolve(mockUsername)
          : Promise.reject('no user for session id found'),
      );

    const mockUser = Mock.of<User>({ username: mockUsername });
    jest
      .spyOn(usersService, 'getUserByUsername')
      .mockImplementation(
        (username: string): Promise<User> =>
          userExistsForUsername && username === mockUsername
            ? Promise.resolve(mockUser)
            : Promise.reject('user not found'),
      );

    jest
      .spyOn(extractNoteIdFromRequestUrlModule, 'extractNoteIdFromRequestUrl')
      .mockImplementation((request: IncomingMessage): string => {
        if (request.url === mockedValidUrl) {
          return mockedValidNoteId;
        } else {
          throw new Error('no valid note id found');
        }
      });

    const mockedNote = Mock.of<Note>({ id: 'mocknote' });
    jest
      .spyOn(notesService, 'getNoteByIdOrAlias')
      .mockImplementation((noteId: string) =>
        noteExistsForNoteId && noteId === mockedValidNoteId
          ? Promise.resolve(mockedNote)
          : Promise.reject('no note found'),
      );

    jest
      .spyOn(permissionsService, 'mayRead')
      .mockImplementation(
        (user: User | null, note: Note): Promise<boolean> =>
          Promise.resolve(
            user === mockUser && note === mockedNote && userHasReadPermissions,
          ),
      );

    const mockedRealtimeNote = Mock.of<RealtimeNote>({
      addClient() {
        //intentionally left blank
      },
    });
    jest
      .spyOn(realtimeNoteService, 'getOrCreateRealtimeNote')
      .mockReturnValue(Promise.resolve(mockedRealtimeNote));

    mockedWebsocketConnection = Mock.of<WebsocketConnection>();
    jest
      .spyOn(websocketConnectionModule, 'WebsocketConnection')
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
    expect(addClientSpy).toBeCalledWith(mockedWebsocketConnection);
    expect(mockedWebsocketCloseSpy).not.toBeCalled();
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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
  });

  it("closes the connection if user doesn't exist for username", async () => {
    userExistsForUsername = false;

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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
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
    expect(addClientSpy).not.toBeCalled();
    expect(mockedWebsocketCloseSpy).toBeCalled();
  });
});
