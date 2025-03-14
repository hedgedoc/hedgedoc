/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  AuthProviderType,
  LogoutResponseDto,
  PendingUserConfirmationDto,
  PendingUserInfoDto,
} from '@hedgedoc/commons';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IdentityService } from '../../../auth/identity.service';
import { OidcService } from '../../../auth/oidc/oidc.service';
import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestWithSession } from '../../utils/request.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private identityService: IdentityService,
    private oidcService: OidcService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @UseGuards(SessionGuard)
  @Delete('logout')
  @OpenApi(200, 400, 401)
  logout(@Req() request: RequestWithSession): LogoutResponseDto {
    let logoutUrl: string | null = null;
    if (request.session.authProviderType === AuthProviderType.OIDC) {
      logoutUrl = this.oidcService.getLogoutUrl(request);
    }
    request.session.destroy((err) => {
      if (err) {
        this.logger.error(
          'Error during logout:' + String(err),
          undefined,
          'logout',
        );
        throw new InternalServerErrorException('Unable to log out');
      }
    });
    return {
      redirect: logoutUrl || '/',
    };
  }

  @Get('pending-user')
  @OpenApi(200, 400)
  getPendingUserData(
    @Req() request: RequestWithSession,
  ): Partial<PendingUserInfoDto> {
    if (
      !request.session.newUserData ||
      !request.session.authProviderIdentifier ||
      !request.session.authProviderType
    ) {
      throw new BadRequestException('No pending user data');
    }
    return request.session.newUserData;
  }

  @Put('pending-user')
  @OpenApi(204, 400)
  async confirmPendingUserData(
    @Req() request: RequestWithSession,
    @Body() pendingUserConfirmationData: PendingUserConfirmationDto,
  ): Promise<void> {
    if (
      !request.session.newUserData ||
      !request.session.authProviderIdentifier ||
      !request.session.authProviderType ||
      !request.session.providerUserId
    ) {
      throw new BadRequestException('No pending user data');
    }
    request.session.userId =
      await this.identityService.createUserWithIdentityFromPendingUserConfirmation(
        request.session.newUserData,
        pendingUserConfirmationData,
        request.session.authProviderType,
        request.session.authProviderIdentifier,
        request.session.providerUserId,
      );
    // Cleanup
    request.session.newUserData = undefined;
  }

  @Delete('pending-user')
  @OpenApi(204, 400)
  deletePendingUserData(@Req() request: RequestWithSession): void {
    request.session.newUserData = undefined;
    request.session.authProviderIdentifier = undefined;
    request.session.authProviderType = undefined;
    request.session.providerUserId = undefined;
    request.session.oidcIdToken = undefined;
  }
}
