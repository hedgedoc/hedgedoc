/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameIdentity, FieldNameUser } from '@hedgedoc/database';
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
import { SessionGuard } from '../../../../auth/session.guard';
import { LoginDto } from '../../../../dtos/login.dto';
import { RegisterDto } from '../../../../dtos/register.dto';
import { UpdatePasswordDto } from '../../../../dtos/update-password.dto';
import { NoLocalIdentityError } from '../../../../errors/errors';
import { ConsoleLoggerService } from '../../../../logger/console-logger.service';
import { UsersService } from '../../../../users/users.service';
import { OpenApi } from '../../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../../utils/decorators/request-user-id.decorator';
import { LoginEnabledGuard } from '../../../utils/guards/login-enabled.guard';
import { RegistrationEnabledGuard } from '../../../utils/guards/registration-enabled.guard';
import { RequestWithSession } from '../../../utils/request.type';

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
    const userId = await this.localIdentityService.createUserWithLocalIdentity(
      registerDto.username,
      registerDto.password,
      registerDto.displayName,
    );
    // Log the user in after registration
    request.session.authProviderType = AuthProviderType.LOCAL;
    request.session.userId = userId;
    request.session.pendingUser = undefined;
  }

  @UseGuards(LoginEnabledGuard, SessionGuard)
  @Put()
  @OpenApi(200, 400, 401)
  async updatePassword(
    @RequestUserId() userId: number,
    @Body() changePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.getUserById(userId);
    const username = user[FieldNameUser.username];
    if (username === null) {
      throw new NoLocalIdentityError('User has no username assigned');
    }
    await this.localIdentityService.checkLocalPassword(
      username,
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
      request.session.authProviderType = AuthProviderType.LOCAL;
      request.session.pendingUser = undefined;
    } catch (error) {
      this.logger.log(`Failed to log in user: ${String(error)}`, 'login');
      throw new UnauthorizedException('Invalid username or password');
    }
  }
}
