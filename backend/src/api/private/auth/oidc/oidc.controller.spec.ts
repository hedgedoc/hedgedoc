/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity } from '@hedgedoc/database';
import { UnauthorizedException } from '@nestjs/common';
import { errors as oidcErrors } from 'openid-client';
import { Mock } from 'ts-mockery';

import type { IdentityService } from '../../../../auth/identity.service';
import type { OidcService } from '../../../../auth/oidc/oidc.service';
import { AuthConfig } from '../../../../config/auth.config';
import { NotInDBError } from '../../../../errors/errors';
import type { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import type { UsersService } from '../../../../users/users.service';
import type { RequestWithSession } from '../../../utils/request.type';
import { OidcController } from './oidc.controller';

describe('OidcController', () => {
  let controller: OidcController;
  let oidcService: OidcService;
  let identityService: jest.Mocked<IdentityService>;
  let saveSession: jest.Mock<() => Promise<void>>;
  let mockRequest: RequestWithSession;

  const createMockRequestWithSession = (): RequestWithSession =>
    Mock.of<RequestWithSession>({
      headers: {
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
      },
      session: {
        csrfToken: null,
        identityLink: null,
        loginAuthProviderIdentifier: null,
        loginAuthProviderType: null,
        oidc: {
          idToken: null,
          loginCode: 'code',
          loginState: 'state',
          sid: null,
        },
        pendingUser: {
          authProviderIdentifier: 'test',
        },
        save: saveSession,
        userId: null,
      },
    });

  const expectSessionIsCleared = () => {
    expect(mockRequest.session.pendingUser).toBeNull();
    expect(mockRequest.session.oidc.loginCode).toBeNull();
    expect(mockRequest.session.oidc.loginState).toBeNull();
    expect(mockRequest.session.identityLink).toBeNull();
    expect(saveSession).toHaveBeenCalledTimes(1);
  };

  let profileEditsAllowed = true;

  beforeEach(() => {
    saveSession = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
    mockRequest = createMockRequestWithSession();
    const logger = Mock.of<ConsoleLoggerService>({
      error: jest.fn<ConsoleLoggerService['error']>(),
      log: jest.fn<ConsoleLoggerService['log']>(),
      setContext: jest.fn<ConsoleLoggerService['setContext']>(),
    });
    const usersService = Mock.of<UsersService>({
      updateUser: jest.fn<UsersService['updateUser']>(),
    });
    const authConfig = Mock.of<AuthConfig>({
      allowProfileEdits: profileEditsAllowed,
    });
    identityService = jest.mocked(
      Mock.of<IdentityService>({
        createIdentity: jest.fn<IdentityService['createIdentity']>(),
        getIdentityFromUserIdAndProviderType:
          jest.fn<IdentityService['getIdentityFromUserIdAndProviderType']>(),
        mayUpdateIdentity: jest.fn<IdentityService['mayUpdateIdentity']>(),
      }),
    );
    oidcService = Mock.of<OidcService>({
      extractUserInfoFromCallback: jest.fn<OidcService['extractUserInfoFromCallback']>(),
      generateCode: jest.fn<OidcService['generateCode']>().mockReturnValue('code'),
      generateState: jest.fn<OidcService['generateState']>().mockReturnValue('state'),
      getAuthorizationUrl: jest
        .fn<OidcService['getAuthorizationUrl']>()
        .mockReturnValue('https://oidc.example.com/authorize'),
      getProviderUserIdFromLinkCallback: jest
        .fn<OidcService['getProviderUserIdFromLinkCallback']>()
        .mockResolvedValue('provider-user-id'),
    });
    controller = new OidcController(logger, usersService, identityService, oidcService, authConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('redirects provider errors with their description', async () => {
    jest.spyOn(oidcService, 'extractUserInfoFromCallback').mockRejectedValue(
      new oidcErrors.OPError({
        error: 'access_denied',
        error_description: 'The user cancelled the login',
      }),
    );

    await expect(controller.callback('test', mockRequest)).resolves.toEqual({
      url: '/login?error=provider&providerError=access_denied&providerDescription=The+user+cancelled+the+login',
    });
    expectSessionIsCleared();
  });

  it('redirects RP validation errors', async () => {
    jest
      .spyOn(oidcService, 'extractUserInfoFromCallback')
      .mockRejectedValue(new oidcErrors.RPError({ message: 'state mismatch' }));

    await expect(controller.callback('test', mockRequest)).resolves.toEqual({
      url: '/login?error=invalid-response',
    });
    expectSessionIsCleared();
  });

  it('redirects expected callback errors', async () => {
    jest
      .spyOn(oidcService, 'extractUserInfoFromCallback')
      .mockRejectedValue(new UnauthorizedException('Missing user identifier'));

    await expect(controller.callback('test', mockRequest)).resolves.toEqual({
      url: '/login?error=invalid-response',
    });
    expectSessionIsCleared();
  });

  it('redirects unexpected callback errors', async () => {
    jest
      .spyOn(oidcService, 'extractUserInfoFromCallback')
      .mockRejectedValue(new Error('Database unavailable'));

    await expect(controller.callback('test', mockRequest)).resolves.toEqual({
      url: '/login?error=internal',
    });
    expectSessionIsCleared();
  });

  it('redirects callback errors when no oidc session data exists yet', async () => {
    const noOidcRequest = Mock.of<RequestWithSession>({
      headers: {
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
      },
      session: {
        csrfToken: null,
        loginAuthProviderIdentifier: null,
        loginAuthProviderType: null,
        pendingUser: null,
        save: saveSession,
        userId: null,
      } as unknown as RequestWithSession['session'],
    });
    jest
      .spyOn(oidcService, 'extractUserInfoFromCallback')
      .mockRejectedValue(new oidcErrors.RPError({ message: 'state mismatch' }));

    await expect(controller.callback('test', noOidcRequest)).resolves.toEqual({
      url: '/login?error=invalid-response',
    });
    expect(noOidcRequest.session.pendingUser).toBeNull();
    expect(noOidcRequest.session.oidc).toEqual({
      idToken: null,
      sid: null,
      loginCode: null,
      loginState: null,
    });
    expect(saveSession).toHaveBeenCalledTimes(1);
  });

  it('starts a separate OIDC identity-linking transaction', () => {
    const linkRequest = createMockRequestWithSession();

    const result = controller.startIdentityLink(linkRequest, 42, 'example-oidc');

    expect(result).toEqual({ url: 'https://oidc.example.com/authorize' });
    expect(linkRequest.session.identityLink).toEqual({
      userId: 42,
      oidcIdentifier: 'example-oidc',
      code: 'code',
      state: 'state',
    });
    expect(oidcService.getAuthorizationUrl).toHaveBeenCalledWith('example-oidc', 'code', 'state');
  });

  it('links an unlinked OIDC identity without changing the active session', async () => {
    const linkRequest = createMockRequestWithSession();
    linkRequest.session.userId = 42;
    linkRequest.session.loginAuthProviderType = AuthProviderType.LOCAL;
    linkRequest.session.identityLink = {
      userId: 42,
      oidcIdentifier: 'example-oidc',
      code: 'code',
      state: 'state',
    };
    identityService.getIdentityFromUserIdAndProviderType.mockRejectedValue(
      new NotInDBError('not found'),
    );

    await expect(controller.callback('example-oidc', linkRequest)).resolves.toEqual({ url: '/' });

    expect(oidcService.getProviderUserIdFromLinkCallback).toHaveBeenCalledWith(
      'example-oidc',
      linkRequest,
      'code',
      'state',
    );
    expect(identityService.createIdentity).toHaveBeenCalledWith(
      42,
      AuthProviderType.OIDC,
      'example-oidc',
      'provider-user-id',
    );
    expect(linkRequest.session.userId).toBe(42);
    expect(linkRequest.session.loginAuthProviderType).toBe(AuthProviderType.LOCAL);
    expect(linkRequest.session.identityLink).toBeNull();
  });

  it('redirects identities linked to another account to a login error', async () => {
    const linkRequest = createMockRequestWithSession();
    linkRequest.session.identityLink = {
      userId: 42,
      oidcIdentifier: 'example-oidc',
      code: 'code',
      state: 'state',
    };
    identityService.getIdentityFromUserIdAndProviderType.mockResolvedValue({
      [FieldNameIdentity.userId]: 24,
      [FieldNameIdentity.providerType]: AuthProviderType.OIDC,
      [FieldNameIdentity.providerIdentifier]: 'example-oidc',
      [FieldNameIdentity.providerUserId]: 'provider-user-id',
      [FieldNameIdentity.passwordHash]: null,
      [FieldNameIdentity.createdAt]: '2026-08-25T12:00:00.000Z',
      [FieldNameIdentity.updatedAt]: '2026-08-25T12:00:00.000Z',
    });

    await expect(controller.callback('example-oidc', linkRequest)).resolves.toEqual({
      url: '/login?error=invalid-response',
    });
    expect(identityService.createIdentity).not.toHaveBeenCalled();
    expect(linkRequest.session.identityLink).toBeNull();
    expect(saveSession).toHaveBeenCalledTimes(1);
  });
});
