/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
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
import { LogoutResponseDto } from '../../../dtos/logout-response.dto';
import { PendingUserConfirmationDto } from '../../../dtos/pending-user-confirmation.dto';
import { PendingUserInfoDto } from '../../../dtos/pending-user-info.dto';
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

  @Delete('logout')
  @OpenApi(200, 400, 401)
  logout(@Req() request: RequestWithSession): LogoutResponseDto {
    // Make logout idempotent and tolerant of missing/expired sessions
    let logoutUrl: string | null = null;
    try {
      if (request.session?.authProviderType === AuthProviderType.OIDC) {
        logoutUrl = this.oidcService.getLogoutUrl(request);
      }
      if (request.session?.destroy) {
        request.session.destroy((err) => {
          if (err) {
            this.logger.error(
              'Error during logout:' + String(err),
              undefined,
              'logout',
            );
          }
        });
      }
    } catch (err) {
      // Never fail the logout call for clients; just log it
      this.logger.error('Unexpected error during logout: ' + String(err), undefined, 'logout');
    }
    return LogoutResponseDto.create({ redirect: logoutUrl || '/' });
  }

  @Get('pending-user')
  @OpenApi(200, 400)
  getPendingUserData(
    @Req() request: RequestWithSession,
  ): Partial<PendingUserInfoDto> {
    if (!request.session.newUserData) {
      throw new BadRequestException('No pending user data');
    }
    return PendingUserInfoDto.create(request.session.newUserData);
  }

  @Put('pending-user')
  @OpenApi(204, 400)
  async confirmPendingUserData(
    @Req() request: RequestWithSession,
    @Body() pendingUserConfirmationData: PendingUserConfirmationDto,
  ): Promise<void> {
    if (
      !request.session.newUserData ||
      !request.session.authProviderType ||
      !request.session.authProviderIdentifier ||
      !request.session.providerUserId
    ) {
      throw new BadRequestException('No pending user data');
    }
    const identity = await this.identityService.createUserWithIdentityFromPendingUserConfirmation(
      request.session.newUserData as PendingUserInfoDto,
      pendingUserConfirmationData,
      request.session.authProviderType,
      request.session.authProviderIdentifier,
      request.session.providerUserId,
    );
    request.session.userId = identity;
    // Cleanup
    request.session.newUserData = undefined;
    request.session.providerUserId = undefined;
  }

  @Delete('pending-user')
  @OpenApi(204, 400)
  deletePendingUserData(@Req() request: RequestWithSession): void {
    request.session.newUserData = undefined;
    request.session.providerUserId = undefined;
    request.session.oidcLoginCode = undefined;
    request.session.oidcLoginState = undefined;
    request.session.oidcIdToken = undefined;
  }
}
