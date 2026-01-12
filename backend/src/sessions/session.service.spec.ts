/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { serialize } from 'cookie';
import { sign } from 'cookie-signature';
import { Cookie } from 'express-session';
import type { Tracker } from 'knex-mock-client';
import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import { Mock } from 'ts-mockery';

import appConfigMock from '../config/mock/app.config.mock';
import { createDefaultMockAuthConfig, registerAuthConfig } from '../config/mock/auth.config.mock';
import { mockKnexDb } from '../database/mock/provider';
import { LoggerModule } from '../logger/logger.module';
import { HEDGEDOC_SESSION } from '../utils/session';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let tracker: Tracker;
  let knexProvider: Provider;
  const authConfig = createDefaultMockAuthConfig();

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, knexProvider],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, registerAuthConfig(authConfig)],
        }),
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    tracker.reset();
  });

  it('getSessionStore', () => {
    const store = service.getSessionStore();
    expect(store).toBeDefined();
  });

  describe('getUserIdForSessionId', () => {
    it('returns the correct user id for session id', async () => {
      const testSessionId = 'testSessionId';
      const testUserId = 1337;
      const sessionsStore = service.getSessionStore();
      sessionsStore.set(
        testSessionId,
        {
          cookie: new Cookie(),
          userId: testUserId,
        },
        async (error) => {
          expect(error).toBeUndefined();
          const result = await service.getUserIdForSessionId(testSessionId);
          expect(result).toEqual(testUserId);
        },
      );
    });
    it('returns undefined for non-valid session id', async () => {
      const testSessionId = 'non-valid-session-id';
      const result = await service.getUserIdForSessionId(testSessionId);
      expect(result).toBeUndefined();
    });
  });

  describe('extractSessionIdFromRequest', () => {
    const mockSocket = Mock.of<Socket>();
    const sessionId = 'testSessionId';
    it('returns empty Optional if no cookie header is set', () => {
      const testRequest = new IncomingMessage(mockSocket);
      expect(service.extractSessionIdFromRequest(testRequest).isEmpty()).toBe(true);
    });
    it('returns empty Optional if cookie is malformed', async () => {
      const testRequest = new IncomingMessage(mockSocket);
      testRequest.headers.cookie = serialize(HEDGEDOC_SESSION, 'foo', {});
      expect(() => service.extractSessionIdFromRequest(testRequest)).toThrow(Error);
    });
    it('returns empty Optional if cookie has invalid signature', async () => {
      const testRequest = new IncomingMessage(mockSocket);
      testRequest.headers.cookie = serialize(HEDGEDOC_SESSION, `s:${sessionId}:fakeSignature`, {});
      expect(() => service.extractSessionIdFromRequest(testRequest)).toThrow(Error);
    });
    it('returns the correct id for session id', () => {
      const signature = sign(sessionId, authConfig.session.secret);
      const testRequest = new IncomingMessage(mockSocket);
      testRequest.headers.cookie = serialize(HEDGEDOC_SESSION, `s:${signature}`, {});
      expect(service.extractSessionIdFromRequest(testRequest).get()).toEqual(sessionId);
    });
  });
});
