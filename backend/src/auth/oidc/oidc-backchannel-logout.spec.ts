/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity, Identity } from '@hedgedoc/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock } from 'ts-mockery';
import * as jose from 'jose';
import type { JWTPayload } from 'jose';

import appConfiguration from '../../config/app.config';
import authConfiguration from '../../config/auth.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { SessionService } from '../../sessions/session.service';
import { IdentityService } from '../identity.service';
import { OidcService } from './oidc.service';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(),
  jwtVerify: jest.fn(),
}));

describe('OidcService - Backchannel Logout', () => {
  let oidcService: OidcService;
  let identityService: IdentityService;
  let sessionService: SessionService;

  const mockOidcConfig = {
    identifier: 'test-oidc',
    providerName: 'Test OIDC',
    issuer: 'https://oidc.example.com',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    scope: 'openid profile email',
  };

  const mockAppConfig = {
    baseUrl: 'http://localhost:3000',
  };

  const mockAuthConfig = {
    oidc: [],
  };

  const mockIssuer = {
    metadata: {
      issuer: 'https://oidc.example.com',
      jwks_uri: 'https://oidc.example.com/.well-known/jwks.json',
    },
  };

  const mockClient = {
    metadata: {
      client_id: 'test-client-id',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcService,
        {
          provide: IdentityService,
          useValue: Mock.of<IdentityService>({
            getIdentityFromUserIdAndProviderType: jest.fn(),
          }),
        },
        {
          provide: SessionService,
          useValue: Mock.of<SessionService>({
            terminateSessionByOidcSid: jest.fn(),
            terminateAllUserSessions: jest.fn(),
          }),
        },
        {
          provide: ConsoleLoggerService,
          useValue: Mock.of<ConsoleLoggerService>({
            setContext: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
          }),
        },
        {
          provide: authConfiguration.KEY,
          useValue: mockAuthConfig,
        },
        {
          provide: appConfiguration.KEY,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    oidcService = module.get<OidcService>(OidcService);
    identityService = module.get<IdentityService>(IdentityService);
    sessionService = module.get<SessionService>(SessionService);

    // Manually set up the client config to bypass the initialization
    (oidcService as any).clientConfigs.set(mockOidcConfig.identifier, {
      client: mockClient,
      issuer: mockIssuer,
      redirectUri: `http://localhost:3000/api/private/auth/oidc/${mockOidcConfig.identifier}/callback`,
      config: mockOidcConfig,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processBackchannelLogout', () => {
    it('should throw NotFoundException for unknown OIDC identifier', async () => {
      await expect(
        oidcService.processBackchannelLogout('unknown-oidc', 'fake-token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if logout token is missing required claims', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        // Missing jti and events
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      await expect(
        oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'valid-jwt-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if logout token contains nonce claim', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          'http://schemas.openid.net/event/backchannel-logout': {},
        },
        sub: 'user-123',
        nonce: 'should-not-be-present',
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      await expect(
        oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'invalid-token-with-nonce'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if logout token missing both sub and sid', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          'http://schemas.openid.net/event/backchannel-logout': {},
        },
        // Missing both sub and sid
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      await expect(
        oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'invalid-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if logout token missing backchannel-logout event', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          // Wrong event type
          'http://schemas.openid.net/event/some-other-event': {},
        },
        sub: 'user-123',
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      await expect(
        oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'invalid-event-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should terminate session by sid when sid is provided', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          'http://schemas.openid.net/event/backchannel-logout': {},
        },
        sid: 'session-123',
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      const mockTerminateByOidcSid =
        sessionService.terminateSessionByOidcSid as jest.MockedFunction<
          typeof sessionService.terminateSessionByOidcSid
        >;
      mockTerminateByOidcSid.mockResolvedValue(true);

      await oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'valid-sid-token');

      expect(mockTerminateByOidcSid).toHaveBeenCalledWith('session-123');
      expect(sessionService.terminateAllUserSessions).not.toHaveBeenCalled();
    });

    it('should terminate all user sessions when only sub is provided', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          'http://schemas.openid.net/event/backchannel-logout': {},
        },
        sub: 'user-123',
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      const mockIdentity: Identity = {
        [FieldNameIdentity.userId]: 42,
        [FieldNameIdentity.providerUserId]: 'user-123',
        [FieldNameIdentity.providerType]: AuthProviderType.OIDC,
        [FieldNameIdentity.providerIdentifier]: mockOidcConfig.identifier,
        [FieldNameIdentity.passwordHash]: null,
        [FieldNameIdentity.createdAt]: new Date().toISOString(),
        [FieldNameIdentity.updatedAt]: new Date().toISOString(),
      };

      const mockGetIdentity =
        identityService.getIdentityFromUserIdAndProviderType as jest.MockedFunction<
          typeof identityService.getIdentityFromUserIdAndProviderType
        >;
      mockGetIdentity.mockResolvedValue(mockIdentity);

      const mockTerminateAll = sessionService.terminateAllUserSessions as jest.MockedFunction<
        typeof sessionService.terminateAllUserSessions
      >;
      mockTerminateAll.mockResolvedValue(3);

      await oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'valid-sub-token');

      expect(mockGetIdentity).toHaveBeenCalledWith(
        'user-123',
        AuthProviderType.OIDC,
        mockOidcConfig.identifier,
      );
      expect(mockTerminateAll).toHaveBeenCalledWith(42);
      expect(sessionService.terminateSessionByOidcSid).not.toHaveBeenCalled();
    });

    it('should succeed even if no sessions are found (idempotent)', async () => {
      const mockJwtVerify = jose.jwtVerify as jest.MockedFunction<typeof jose.jwtVerify>;
      const mockPayload: JWTPayload = {
        iss: 'https://oidc.example.com',
        aud: 'test-client-id',
        iat: Date.now() / 1000,
        jti: 'unique-token-id',
        events: {
          'http://schemas.openid.net/event/backchannel-logout': {},
        },
        sid: 'non-existent-session',
      };
      mockJwtVerify.mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
        key: new Uint8Array(),
      });

      const mockTerminateByOidcSid =
        sessionService.terminateSessionByOidcSid as jest.MockedFunction<
          typeof sessionService.terminateSessionByOidcSid
        >;
      mockTerminateByOidcSid.mockResolvedValue(false);

      // Should not throw
      await expect(
        oidcService.processBackchannelLogout(mockOidcConfig.identifier, 'valid-token-no-session'),
      ).resolves.not.toThrow();
    });
  });
});
