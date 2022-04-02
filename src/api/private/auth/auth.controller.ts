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
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Session } from 'express-session';

import { IdentityService } from '../../../identity/identity.service';
import { LdapLoginDto } from '../../../identity/ldap/ldap-login.dto';
import { LdapAuthGuard } from '../../../identity/ldap/ldap.strategy';
import { LocalAuthGuard } from '../../../identity/local/local.strategy';
import { LoginDto } from '../../../identity/local/login.dto';
import { RegisterDto } from '../../../identity/local/register.dto';
import { UpdatePasswordDto } from '../../../identity/local/update-password.dto';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { User } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { LoginEnabledGuard } from '../../utils/login-enabled.guard';
import { OpenApi } from '../../utils/openapi.decorator';
import { RegistrationEnabledGuard } from '../../utils/registration-enabled.guard';
import { RequestUser } from '../../utils/request-user.decorator';

type RequestWithSession = Request & {
  session: {
    authProvider: string;
    user: string;
  };
};

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
  @OpenApi(201, 400, 409)
  async registerUser(@Body() registerDto: RegisterDto): Promise<void> {
    const user = await this.usersService.createUser(
      registerDto.username,
      registerDto.displayName,
    );
    // ToDo: Figure out how to rollback user if anything with this calls goes wrong
    await this.identityService.createLocalIdentity(user, registerDto.password);
  }

  @UseGuards(LoginEnabledGuard, SessionGuard)
  @Put('local')
  @OpenApi(200, 400, 401)
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
  @OpenApi(201, 400, 401)
  login(
    @Req()
    request: RequestWithSession,
    @Body() loginDto: LoginDto,
  ): void {
    // There is no further testing needed as we only get to this point if LocalAuthGuard was successful
    request.session.user = loginDto.username;
    request.session.authProvider = 'local';
  }

  @UseGuards(LdapAuthGuard)
  @Post('ldap/:ldapIdentifier')
  @OpenApi(201, 400, 401)
  loginWithLdap(
    @Req()
    request: RequestWithSession,
    @Param('ldapIdentifier') ldapIdentifier: string,
    @Body() loginDto: LdapLoginDto,
  ): void {
    // There is no further testing needed as we only get to this point if LocalAuthGuard was successful
    request.session.user = loginDto.username;
    request.session.authProvider = 'ldap';
  }

  @UseGuards(SessionGuard)
  @Delete('logout')
  @OpenApi(204, 400, 401)
  logout(@Req() request: Request & { session: Session }): Promise<void> {
    return new Promise((resolve, reject) => {
      request.session.destroy((err) => {
        if (err) {
          this.logger.error('Encountered an error while logging out: ${err}');
          reject(new BadRequestException('Unable to log out'));
        } else {
          resolve();
        }
      });
    });
  }
}
