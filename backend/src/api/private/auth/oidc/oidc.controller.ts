/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity } from '@hedgedoc/database';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Redirect,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags } from '@nestjs/swagger';

import { IdentityService } from '../../../../auth/identity.service';
import { OidcService } from '../../../../auth/oidc/oidc.service';
import { BackchannelLogoutDto } from '../../../../dtos/backchannel-logout.dto';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { CsrfExempt } from '../../../utils/decorators/csrf-exempt.decorator';
import { OpenApi } from '../../../utils/decorators/openapi.decorator';
import { RequestWithSession } from '../../../utils/request.type';

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
    request.session.oidc = {
      loginCode: code,
      loginState: state,
    };
    request.session.pendingUser = {
      authProviderType: AuthProviderType.OIDC,
      authProviderIdentifier: oidcIdentifier,
    };
    const authorizationUrl = this.oidcService.getAuthorizationUrl(oidcIdentifier, code, state);
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
      const userInfo = await this.oidcService.extractUserInfoFromCallback(oidcIdentifier, request);
      const oidcUserIdentifier = request.session.pendingUser?.providerUserId;
      if (!oidcUserIdentifier) {
        this.logger.log('No OIDC user identifier in callback', 'callback');
        throw new UnauthorizedException('No OIDC user identifier found');
      }
      const identity = await this.oidcService.getExistingOidcIdentity(
        oidcIdentifier,
        oidcUserIdentifier,
      );
      const mayUpdate = this.identityService.mayUpdateIdentity(oidcIdentifier);

      if (identity === null) {
        return { url: '/new-user' };
      }

      const userId = identity[FieldNameIdentity.userId];
      if (mayUpdate) {
        await this.usersService.updateUser(
          userId,
          userInfo.displayName,
          userInfo.email,
          userInfo.photoUrl,
        );
      }

      request.session.userId = userId;
      request.session.authProviderType = AuthProviderType.OIDC;
      request.session.authProviderIdentifier = oidcIdentifier;
      request.session.pendingUser = undefined;
      return { url: '/' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.log('Error during OIDC callback: ' + String(error), 'callback');
      throw new InternalServerErrorException();
    }
  }

  @Post(':oidcIdentifier/backchannel-logout')
  @HttpCode(200)
  @CsrfExempt()
  @OpenApi(200, 400)
  async backchannelLogout(
    @Param('oidcIdentifier') oidcIdentifier: string,
    @Body() body: BackchannelLogoutDto,
  ): Promise<void> {
    try {
      await this.oidcService.processBackchannelLogout(oidcIdentifier, body.logout_token);
      this.logger.debug(
        `Backchannel logout successful for provider ${oidcIdentifier}`,
        'backchannelLogout',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Error during backchannel logout: ${String(error)}`,
        undefined,
        'backchannelLogout',
      );
      throw new BadRequestException('Invalid logout token');
    }
  }
}
