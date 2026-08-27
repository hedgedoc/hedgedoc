/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType, AuthErrorCodes } from '@hedgedoc/commons';
import { FieldNameIdentity } from '@hedgedoc/database';
import {
  BadRequestException,
  Body,
  Controller,
  ConflictException,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Redirect,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ApiTags } from '@nestjs/swagger';
import { errors as oidcErrors } from 'openid-client';

import { IdentityService } from '../../../../auth/identity.service';
import { OidcService } from '../../../../auth/oidc/oidc.service';
import { SessionGuard } from '../../../../auth/session.guard';
import authConfiguration, { AuthConfig } from '../../../../config/auth.config';
import { BackchannelLogoutDto } from '../../../../dtos/backchannel-logout.dto';
import { NotInDBError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { CsrfExempt } from '../../../utils/decorators/csrf-exempt.decorator';
import { OpenApi } from '../../../utils/decorators/openapi.decorator';
import { RequestWithSession } from '../../../utils/request.type';
import { RequestUserId } from '../../../utils/decorators/request-user-id.decorator';

@ApiTags('auth')
@Controller('/auth/oidc')
export class OidcController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private identityService: IdentityService,
    private oidcService: OidcService,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(OidcController.name);
  }

  // These GET endpoints have side effects (session mutation), so reject
  // anything that isn't a real navigation - avoids double-firing from
  // client-side link prefetching. Only rejects on a positive mismatch.
  private assertTopLevelNavigation(request: RequestWithSession): void {
    const mode = request.headers['sec-fetch-mode'];
    const dest = request.headers['sec-fetch-dest'];
    if (
      (mode !== undefined && mode !== 'navigate') ||
      (dest !== undefined && dest !== 'document')
    ) {
      throw new BadRequestException('This endpoint must be reached via a real browser navigation');
    }
  }

  @UseGuards(SessionGuard)
  @Post(':oidcIdentifier/link')
  @OpenApi(201, 401, 403, 404, 429)
  startIdentityLink(
    @Req() request: RequestWithSession,
    @RequestUserId({ forbidGuests: true }) userId: number,
    @Param('oidcIdentifier') oidcIdentifier: string,
  ): { url: string } {
    if (!this.authConfig.allowProfileEdits) {
      throw new ForbiddenException('Profile edits are disabled');
    }
    const code = this.oidcService.generateCode();
    const state = this.oidcService.generateState();
    request.session.identityLink = {
      userId,
      oidcIdentifier,
      code,
      state,
    };
    return { url: this.oidcService.getAuthorizationUrl(oidcIdentifier, code, state) };
  }

  @Get(':oidcIdentifier')
  @Redirect()
  @OpenApi(201, 400, 401, 429)
  async loginWithOpenIdConnect(
    @Req() request: RequestWithSession,
    @Param('oidcIdentifier') oidcIdentifier: string,
  ): Promise<{ url: string }> {
    this.assertTopLevelNavigation(request);
    const code = this.oidcService.generateCode();
    const state = this.oidcService.generateState();
    request.session.oidc = {
      loginCode: code,
      loginState: state,
      idToken: null,
      sid: null,
    };
    request.session.pendingUser = {
      authProviderType: AuthProviderType.OIDC,
      authProviderIdentifier: oidcIdentifier,
    };
    const authorizationUrl = this.oidcService.getAuthorizationUrl(oidcIdentifier, code, state);
    // Persist before redirecting - the async onSend save otherwise races
    // @Redirect()'s response and can crash with ERR_HTTP_HEADERS_SENT.
    await request.session.save();
    return { url: authorizationUrl };
  }

  @Get(':oidcIdentifier/callback')
  @Redirect()
  @OpenApi(201, 400, 401, 500)
  async callback(
    @Param('oidcIdentifier') oidcIdentifier: string,
    @Req() request: RequestWithSession,
  ): Promise<{ url: string }> {
    this.assertTopLevelNavigation(request);
    try {
      const identityLink = request.session.identityLink;
      if (identityLink) {
        try {
          if (identityLink.oidcIdentifier !== oidcIdentifier) {
            throw new BadRequestException('OIDC provider does not match identity link transaction');
          }
          const providerUserId = await this.oidcService.getProviderUserIdFromLinkCallback(
            oidcIdentifier,
            request,
            identityLink.code,
            identityLink.state,
          );
          try {
            const existingIdentity =
              await this.identityService.getIdentityFromUserIdAndProviderType(
                providerUserId,
                AuthProviderType.OIDC,
                oidcIdentifier,
              );
            if (existingIdentity[FieldNameIdentity.userId] !== identityLink.userId) {
              throw new ConflictException(
                'This OIDC identity is already linked to another account',
              );
            }
          } catch (error) {
            if (error instanceof NotInDBError) {
              await this.identityService.createIdentity(
                identityLink.userId,
                AuthProviderType.OIDC,
                oidcIdentifier,
                providerUserId,
              );
            } else {
              throw error;
            }
          }
          return { url: '/' };
        } finally {
          request.session.identityLink = null;
        }
      }
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
        // See loginWithOpenIdConnect() above.
        await request.session.save();
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
      request.session.loginAuthProviderType = AuthProviderType.OIDC;
      request.session.loginAuthProviderIdentifier = oidcIdentifier;
      request.session.pendingUser = null;
      await request.session.save();
      return { url: '/' };
    } catch (error) {
      const errorParams = new URLSearchParams();
      if (error instanceof oidcErrors.OPError) {
        errorParams.set('error', AuthErrorCodes.PROVIDER);
        if (error.error) {
          errorParams.set('providerError', error.error);
        }
        if (error.error_description) {
          errorParams.set('providerDescription', error.error_description);
        }
      } else if (error instanceof oidcErrors.RPError || error instanceof HttpException) {
        errorParams.set('error', AuthErrorCodes.INVALID_RESPONSE);
      } else {
        errorParams.set('error', AuthErrorCodes.INTERNAL);
      }

      this.logger.error(
        'Error during OIDC callback: ' + String(error),
        error instanceof Error ? error.stack : undefined,
        'callback',
      );
      request.session.pendingUser = null;
      // The callback may fail before extractUserInfoFromCallback assigns
      // session.oidc (e.g. state mismatch on a session that never ran
      // loginWithOpenIdConnect), so reset the whole object like
      // AuthController.deletePendingUserData does instead of touching a
      // possibly-undefined property.
      request.session.oidc = {
        idToken: null,
        sid: null,
        loginCode: null,
        loginState: null,
      };
      await request.session.save();
      return { url: `/login?${errorParams.toString()}` };
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
