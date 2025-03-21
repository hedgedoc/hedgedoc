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
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { User } from '../../../../users/user.entity';
import { UsersService } from '../../../../users/users.service';
import { LoginEnabledGuard } from '../../../utils/login-enabled.guard';
import { OpenApi } from '../../../utils/openapi.decorator';
import { RegistrationEnabledGuard } from '../../../utils/registration-enabled.guard';
import { RequestUser } from '../../../utils/request-user.decorator';

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
    const user = await this.usersService.createUser(
      registerDto.username,
      registerDto.displayName,
      null,
      null,
    );
    await this.localIdentityService.createLocalIdentity(
      user,
      registerDto.password,
    );
    // Log the user in after registration
    request.session.authProviderType = ProviderType.LOCAL;
    request.session.username = registerDto.username;
  }

  @UseGuards(LoginEnabledGuard, SessionGuard)
  @Put()
  @OpenApi(200, 400, 401)
  async updatePassword(
    @RequestUser() user: User,
    @Body() changePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    await this.localIdentityService.checkLocalPassword(
      user,
      changePasswordDto.currentPassword,
    );
    await this.localIdentityService.updateLocalPassword(
      user,
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
      const user = await this.usersService.getUserByUsername(loginDto.username);
      await this.localIdentityService.checkLocalPassword(
        user,
        loginDto.password,
      );
      request.session.username = loginDto.username;
      request.session.authProviderType = ProviderType.LOCAL;
    } catch (error) {
      this.logger.error(`Failed to log in user: ${String(error)}`);
      throw new UnauthorizedException('Invalid username or password');
    }
  }
}
