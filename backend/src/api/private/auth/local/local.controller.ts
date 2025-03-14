/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  LoginDto,
  ProviderType,
  RegisterDto,
  UpdatePasswordDto,
} from '@hedgedoc/commons';
import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LocalService } from '../../../../auth/local/local.service';
import {
  RequestWithSession,
  SessionGuard,
} from '../../../../auth/session.guard';
import { FieldNameIdentity, FieldNameUser } from '../../../../database/types';
import { InvalidCredentialsError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { LoginEnabledGuard } from '../../../utils/login-enabled.guard';
import { OpenApi } from '../../../utils/openapi.decorator';
import { RegistrationEnabledGuard } from '../../../utils/registration-enabled.guard';
import { RequestUserId } from '../../../utils/request-user.decorator';

@ApiTags('auth')
@Controller('/auth/local')
export class LocalController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private localIdentityService: LocalService,
  ) {
    this.logger.setContext(LocalController.name);
  }

  @UseGuards(RegistrationEnabledGuard)
  @Post()
  @OpenApi(201, 400, 403, 409)
  async registerUser(
    @Req() request: RequestWithSession,
    @Body() registerDto: RegisterDto,
  ): Promise<void> {
    await this.localIdentityService.checkPasswordStrength(registerDto.password);
    const identity = await this.localIdentityService.createLocalIdentity(
      registerDto.username,
      registerDto.password,
      registerDto.displayName,
    );
    // Log the user in after registration
    request.session.authProviderType = ProviderType.LOCAL;
    request.session.userId = identity[FieldNameIdentity.userId];
  }

  @UseGuards(LoginEnabledGuard, SessionGuard)
  @Put()
  @OpenApi(200, 400, 401)
  async updatePassword(
    @RequestUserId() userId: number,
    @Body() changePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.getUserById(userId);
    await this.localIdentityService.checkLocalPassword(
      user[FieldNameUser.username],
      changePasswordDto.currentPassword,
    );
    await this.localIdentityService.updateLocalPassword(
      userId,
      changePasswordDto.newPassword,
    );
  }

  @UseGuards(LoginEnabledGuard)
  @Post('login')
  @OpenApi(201, 400, 401)
  async login(
    @Req()
    request: RequestWithSession,
    @Body() loginDto: LoginDto,
  ): Promise<void> {
    try {
      const identity = await this.localIdentityService.checkLocalPassword(
        loginDto.username,
        loginDto.password,
      );
      request.session.userId = identity[FieldNameIdentity.userId];
      request.session.authProviderType = ProviderType.LOCAL;
    } catch (error) {
      this.logger.info(`Failed to log in user: ${String(error)}`, 'login');
      throw new UnauthorizedException('Invalid username or password');
    }
  }
}
