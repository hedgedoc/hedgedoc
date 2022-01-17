/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from 'express-session';

import { IdentityService } from '../../../identity/identity.service';
import { LocalAuthGuard } from '../../../identity/local/local.strategy';
import { LoginDto } from '../../../identity/local/login.dto';
import { RegisterDto } from '../../../identity/local/register.dto';
import { UpdatePasswordDto } from '../../../identity/local/update-password.dto';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import {
  badRequestDescription,
  conflictDescription,
  unauthorizedDescription,
} from '../../utils/descriptions';
import { LoginEnabledGuard } from '../../utils/login-enabled.guard';
import { RegistrationEnabledGuard } from '../../utils/registration-enabled.guard';
import { RequestUser } from '../../utils/request-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
    private identityService: IdentityService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @UseGuards(RegistrationEnabledGuard)
  @Post('local')
  @ApiBadRequestResponse({ description: badRequestDescription })
  @ApiConflictResponse({ description: conflictDescription })
  async registerUser(@Body() registerDto: RegisterDto): Promise<void> {
    const user = await this.usersService.createUser(
      registerDto.username,
      registerDto.displayname,
    );
    // ToDo: Figure out how to rollback user if anything with this calls goes wrong
    await this.identityService.createLocalIdentity(user, registerDto.password);
  }

  @UseGuards(LoginEnabledGuard, SessionGuard)
  @Put('local')
  @ApiBadRequestResponse({ description: badRequestDescription })
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  async updatePassword(
    @RequestUser() user: User,
    @Body() changePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    await this.identityService.checkLocalPassword(
      user,
      changePasswordDto.currentPassword,
    );
    await this.identityService.updateLocalPassword(
      user,
      changePasswordDto.newPassword,
    );
    return;
  }

  @UseGuards(LoginEnabledGuard, LocalAuthGuard)
  @Post('local/login')
  @ApiUnauthorizedResponse({ description: unauthorizedDescription })
  login(
    @Req() request: Request & { session: { user: string } },
    @Body() loginDto: LoginDto,
  ): void {
    // There is no further testing needed as we only get to this point if LocalAuthGuard was successful
    request.session.user = loginDto.username;
  }

  @UseGuards(SessionGuard)
  @Delete('logout')
  @ApiBadRequestResponse({ description: badRequestDescription })
  logout(@Req() request: Request & { session: Session }): void {
    request.session.destroy((err) => {
      if (err) {
        this.logger.error('Encountered an error while logging out: ${err}');
        throw new BadRequestException('Unable to log out');
      }
    });
  }
}
