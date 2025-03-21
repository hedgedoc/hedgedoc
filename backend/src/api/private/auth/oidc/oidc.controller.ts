/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '@hedgedoc/commons';
import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Redirect,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags } from '@nestjs/swagger';

import { IdentityService } from '../../../../auth/identity.service';
import { OidcService } from '../../../../auth/oidc/oidc.service';
import { RequestWithSession } from '../../../../auth/session.guard';
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
  @OpenApi(201, 400, 401, 500)
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
        this.logger.log('No OIDC user identifier in callback', 'callback');
        throw new UnauthorizedException('No OIDC user identifier found');
      }
      request.session.authProviderType = ProviderType.OIDC;
      const identity = await this.oidcService.getExistingOidcIdentity(
        oidcIdentifier,
        oidcUserIdentifier,
      );
      const mayUpdate = this.identityService.mayUpdateIdentity(oidcIdentifier);

      if (identity === null) {
        request.session.newUserData = userInfo;
        return { url: '/new-user' };
      }

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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.log(
        'Error during OIDC callback: ' + String(error),
        'callback',
      );
      throw new InternalServerErrorException();
    }
  }
}
