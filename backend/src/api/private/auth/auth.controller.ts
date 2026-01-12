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
        this.logger.error('Error during logout:' + String(err), undefined, 'logout');
        throw new InternalServerErrorException('Unable to log out');
      }
    });
    return LogoutResponseDto.create({
      redirect: logoutUrl || '/',
    });
  }

  @Get('pending-user')
  @OpenApi(200, 400)
  getPendingUserData(@Req() request: RequestWithSession): Partial<PendingUserInfoDto> {
    if (!request.session.pendingUser?.confirmationData) {
      throw new BadRequestException('No pending user data');
    }
    return PendingUserInfoDto.create(request.session.pendingUser.confirmationData);
  }

  @Put('pending-user')
  @OpenApi(204, 400)
  async confirmPendingUserData(
    @Req() request: RequestWithSession,
    @Body() pendingUserConfirmationData: PendingUserConfirmationDto,
  ): Promise<void> {
    if (
      !request.session.pendingUser?.confirmationData ||
      !request.session.pendingUser?.authProviderType ||
      !request.session.pendingUser?.authProviderIdentifier ||
      !request.session.pendingUser?.providerUserId
    ) {
      throw new BadRequestException('No pending user data');
    }
    request.session.userId =
      await this.identityService.createUserWithIdentityFromPendingUserConfirmation(
        request.session.pendingUser.confirmationData,
        pendingUserConfirmationData,
        request.session.pendingUser.authProviderType,
        request.session.pendingUser.authProviderIdentifier,
        request.session.pendingUser.providerUserId,
      );
    request.session.authProviderType = request.session.pendingUser.authProviderType;
    request.session.authProviderIdentifier = request.session.pendingUser.authProviderIdentifier;
    // Cleanup
    request.session.pendingUser = undefined;
  }

  @Delete('pending-user')
  @OpenApi(204, 400)
  deletePendingUserData(@Req() request: RequestWithSession): void {
    request.session.pendingUser = undefined;
    request.session.oidc = undefined;
  }
}
