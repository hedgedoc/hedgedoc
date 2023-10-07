/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as ConnectTypeormModule from 'connect-typeorm';
import { TypeormStore } from 'connect-typeorm';
import * as parseCookieModule from 'cookie';
import * as cookieSignatureModule from 'cookie-signature';
import { IncomingMessage } from 'http';
import { Mock } from 'ts-mockery';
import { Repository } from 'typeorm';

import { AppConfig } from '../config/app.config';
import { AuthConfig } from '../config/auth.config';
import { DatabaseType } from '../config/database-type.enum';
import { DatabaseConfig } from '../config/database.config';
import { Loglevel } from '../config/loglevel.enum';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HEDGEDOC_SESSION } from '../utils/session';
import { Session } from './session.entity';
import { SessionService, SessionState } from './session.service';

jest.mock('cookie');
jest.mock('cookie-signature');

describe('SessionService', () => {
  let mockedTypeormStore: TypeormStore;
  let mockedSessionRepository: Repository<Session>;
  let databaseConfigMock: DatabaseConfig;
  let authConfigMock: AuthConfig;
  let typeormStoreConstructorMock: jest.SpyInstance;
  const mockedExistingSessionId = 'mockedExistingSessionId';
  const mockUsername = 'mock-user';
  const mockSecret = 'mockSecret';
  let sessionService: SessionService;

  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    const mockedExistingSession = Mock.of<SessionState>({
      username: mockUsername,
    });
    mockedTypeormStore = Mock.of<TypeormStore>({
      connect: jest.fn(() => mockedTypeormStore),
      get: jest.fn(((sessionId, callback) => {
        if (sessionId === mockedExistingSessionId) {
          callback(undefined, mockedExistingSession);
        } else {
          callback(new Error("Session doesn't exist"), undefined);
        }
      }) as TypeormStore['get']),
    });
    mockedSessionRepository = Mock.of<Repository<Session>>({});
    databaseConfigMock = Mock.of<DatabaseConfig>({
      type: DatabaseType.SQLITE,
    });
    authConfigMock = Mock.of<AuthConfig>({
      session: {
        secret: mockSecret,
      },
    });

    typeormStoreConstructorMock = jest
      .spyOn(ConnectTypeormModule, 'TypeormStore')
      .mockReturnValue(mockedTypeormStore);

    sessionService = new SessionService(
      new ConsoleLoggerService({ loglevel: Loglevel.DEBUG } as AppConfig),
      mockedSessionRepository,
      databaseConfigMock,
      authConfigMock,
    );
  });

  it('creates a new TypeormStore on create', () => {
    expect(typeormStoreConstructorMock).toHaveBeenCalledWith({
      cleanupLimit: 2,
      limitSubquery: true,
    });
    expect(mockedTypeormStore.connect).toHaveBeenCalledWith(
      mockedSessionRepository,
    );
    expect(sessionService.getTypeormStore()).toBe(mockedTypeormStore);
  });

  it('can fetch a username for an existing session', async () => {
    await expect(
      sessionService.fetchUsernameForSessionId(mockedExistingSessionId),
    ).resolves.toBe(mockUsername);
  });

  it("can't fetch a username for a non-existing session", async () => {
    await expect(
      sessionService.fetchUsernameForSessionId("doesn't exist"),
    ).rejects.toThrow();
  });

  describe('extract verified session id from request', () => {
    const validCookieHeader = 'validCookieHeader';
    const validSessionId = 'validSessionId';

    function mockParseCookieModule(sessionCookieContent: string): void {
      jest
        .spyOn(parseCookieModule, 'parse')
        .mockImplementation((header: string): Record<string, string> => {
          if (header === validCookieHeader) {
            return {
              [HEDGEDOC_SESSION]: sessionCookieContent,
            };
          } else {
            return {};
          }
        });
    }

    beforeEach(() => {
      jest.spyOn(parseCookieModule, 'parse').mockImplementation(() => {
        throw new Error('call not expected!');
      });
      jest
        .spyOn(cookieSignatureModule, 'unsign')
        .mockImplementation((value, secret) => {
          if (value.endsWith('.validSignature') && secret === mockSecret) {
            return 'decryptedValue';
          } else {
            return false;
          }
        });
    });

    it('fails if no cookie header is present', () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: {},
      });
      expect(
        sessionService.extractSessionIdFromRequest(mockedRequest).isEmpty(),
      ).toBeTruthy();
    });

    it("fails if the cookie header isn't valid", () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: 'no' },
      });
      mockParseCookieModule(`s:anyValidSessionId.validSignature`);
      expect(
        sessionService.extractSessionIdFromRequest(mockedRequest).isEmpty(),
      ).toBeTruthy();
    });

    it("fails if the hedgedoc session cookie isn't marked as signed", () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: validCookieHeader },
      });
      mockParseCookieModule('sessionId.validSignature');
      expect(() =>
        sessionService.extractSessionIdFromRequest(mockedRequest),
      ).toThrow(
        'cookie "hedgedoc-session" doesn\'t look like a signed session cookie',
      );
    });

    it("fails if the hedgedoc session cookie doesn't contain a session id", () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: validCookieHeader },
      });
      mockParseCookieModule('s:.validSignature');
      expect(() =>
        sessionService.extractSessionIdFromRequest(mockedRequest),
      ).toThrow(
        'cookie "hedgedoc-session" doesn\'t look like a signed session cookie',
      );
    });

    it("fails if the hedgedoc session cookie doesn't contain a signature", () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: validCookieHeader },
      });
      mockParseCookieModule('s:sessionId.');
      expect(() =>
        sessionService.extractSessionIdFromRequest(mockedRequest),
      ).toThrow(
        'cookie "hedgedoc-session" doesn\'t look like a signed session cookie',
      );
    });

    it("fails if the hedgedoc session cookie isn't signed correctly", () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: validCookieHeader },
      });
      mockParseCookieModule('s:sessionId.invalidSignature');
      expect(() =>
        sessionService.extractSessionIdFromRequest(mockedRequest),
      ).toThrow('signature of cookie "hedgedoc-session" isn\'t valid.');
    });

    it('can extract a session id from a valid request', () => {
      const mockedRequest = Mock.of<IncomingMessage>({
        headers: { cookie: validCookieHeader },
      });
      mockParseCookieModule(`s:${validSessionId}.validSignature`);
      expect(
        sessionService.extractSessionIdFromRequest(mockedRequest).get(),
      ).toBe(validSessionId);
    });
  });
});
