/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Controller,
  Get,
  Param,
  Redirect,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IdentityService } from '../../../../identity/identity.service';
import { OidcService } from '../../../../identity/oidc/oidc.service';
import { ProviderType } from '../../../../identity/provider-type.enum';
import { RequestWithSession } from '../../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { OpenApi } from '../../../utils/openapi.decorator';

@ApiTags('auth')
@Controller('/auth/oidc')
export class OidcController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private identityService: IdentityService,
    private oidcService: OidcService,
  ) {
    this.logger.setContext(OidcController.name);
  }

  @Get(':oidcIdentifier')
  @Redirect()
  @OpenApi(201, 400, 401)
  loginWithOpenIdConnect(
    @Req() request: RequestWithSession,
    @Param('oidcIdentifier') oidcIdentifier: string,
  ): { url: string } {
    const code = this.oidcService.generateCode();
    const state = this.oidcService.generateState();
    request.session.oidcLoginCode = code;
    request.session.oidcLoginState = state;
    request.session.authProviderType = ProviderType.OIDC;
    request.session.authProviderIdentifier = oidcIdentifier;
    const authorizationUrl = this.oidcService.getAuthorizationUrl(
      oidcIdentifier,
      code,
      state,
    );
    return { url: authorizationUrl };
  }

  @Get(':oidcIdentifier/callback')
  @Redirect()
  @OpenApi(201, 400, 401)
  async callback(
    @Param('oidcIdentifier') oidcIdentifier: string,
    @Req() request: RequestWithSession,
  ): Promise<{ url: string }> {
    try {
      const userInfo = await this.oidcService.extractUserInfoFromCallback(
        oidcIdentifier,
        request,
      );
      const oidcUserIdentifier = request.session.providerUserId;
      if (!oidcUserIdentifier) {
        throw new Error('No OIDC user identifier found');
      }
      const identity = await this.oidcService.getExistingOidcIdentity(
        oidcIdentifier,
        oidcUserIdentifier,
      );
      request.session.authProviderType = ProviderType.OIDC;
      const mayUpdate = this.identityService.mayUpdateIdentity(oidcIdentifier);
      if (identity !== null) {
        const user = await identity.user;
        if (mayUpdate) {
          await this.usersService.updateUser(
            user,
            userInfo.displayName,
            userInfo.email,
            userInfo.photoUrl,
          );
        }

        request.session.username = user.username;
        return { url: '/' };
      } else {
        request.session.newUserData = userInfo;
        return { url: '/new-user' };
      }
    } catch (error) {
      this.logger.log(
        'Error during OIDC callback:' + String(error),
        'callback',
      );
      throw new UnauthorizedException();
    }
  }
}
