/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GuestLoginDto } from '../../../../dtos/guest-login.dto';
import { GuestRegistrationResponseDto } from '../../../../dtos/guest-registration-response.dto';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { OpenApi } from '../../../utils/decorators/openapi.decorator';
import { GuestsEnabledGuard } from '../../../utils/guards/guests-enabled.guard';
import { RequestWithSession } from '../../../utils/request.type';

@ApiTags('auth')
@Controller('/auth/guest')
export class GuestController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
  ) {
    this.logger.setContext(GuestController.name);
  }

  @UseGuards(GuestsEnabledGuard)
  @Post('register')
  @OpenApi(201, 403)
  async registerGuestUser(
    @Req() request: RequestWithSession,
  ): Promise<GuestRegistrationResponseDto> {
    const [uuid, userId] = await this.usersService.createGuestUser();
    // Log the user in after registration
    request.session.loginAuthProviderType = AuthProviderType.GUEST;
    request.session.userId = userId;
    return GuestRegistrationResponseDto.create({
      uuid,
    });
  }

  @UseGuards(GuestsEnabledGuard)
  @Post('login')
  @OpenApi(204, 400)
  async loginGuestUser(
    @Req() request: RequestWithSession,
    @Body() loginDto: GuestLoginDto,
  ): Promise<void> {
    const userId = await this.usersService.getUserIdByGuestUuid(loginDto.uuid);
    request.session.loginAuthProviderType = AuthProviderType.GUEST;
    request.session.userId = userId;
  }
}
