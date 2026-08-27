/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it, jest } from '@jest/globals';
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity } from '@hedgedoc/database';
import { ConflictException } from '@nestjs/common';

import { IdentityService } from '../../../../auth/identity.service';
import { OidcService } from '../../../../auth/oidc/oidc.service';
import { AuthConfig } from '../../../../config/auth.config';
import { NotInDBError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import type { RequestWithSession } from '../../../utils/request.type';
import { OidcController } from './oidc.controller';

describe('OidcController identity linking', () => {
  const createController = (profileEditsAllowed = true) => {
    const identityService = {
      createIdentity: jest.fn<IdentityService['createIdentity']>(),
      getIdentityFromUserIdAndProviderType:
        jest.fn<IdentityService['getIdentityFromUserIdAndProviderType']>(),
      mayUpdateIdentity: jest.fn<IdentityService['mayUpdateIdentity']>(),
    };
    const oidcService = {
      generateCode: jest.fn().mockReturnValue('code'),
      generateState: jest.fn().mockReturnValue('state'),
      getAuthorizationUrl: jest.fn().mockReturnValue('https://oidc.example.com/authorize'),
      getProviderUserIdFromLinkCallback: jest
        .fn<OidcService['getProviderUserIdFromLinkCallback']>()
        .mockResolvedValue('provider-user-id'),
    };
    const controller = new OidcController(
      { log: jest.fn(), setContext: jest.fn() } as unknown as ConsoleLoggerService,
      { updateUser: jest.fn() } as unknown as UsersService,
      identityService as unknown as IdentityService,
      oidcService as unknown as OidcService,
      { allowProfileEdits: profileEditsAllowed } as AuthConfig,
    );
    return { controller, identityService, oidcService };
  };

  const request = (): RequestWithSession =>
    ({
      session: {
        identityLink: null,
      },
    }) as RequestWithSession;

  it('starts a separate OIDC identity-linking transaction', () => {
    const { controller, oidcService } = createController();
    const linkRequest = request();

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
    const { controller, identityService, oidcService } = createController();
    const linkRequest = request();
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

  it('rejects identities linked to another account', async () => {
    const { controller, identityService } = createController();
    const linkRequest = request();
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

    await expect(controller.callback('example-oidc', linkRequest)).rejects.toThrow(
      ConflictException,
    );
    expect(identityService.createIdentity).not.toHaveBeenCalled();
    expect(linkRequest.session.identityLink).toBeNull();
  });
});
