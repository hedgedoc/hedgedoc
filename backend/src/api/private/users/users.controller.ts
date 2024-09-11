/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { UserInfoDto } from '../../../users/user-info.dto';
import {
  UsernameCheckDto,
  UsernameCheckResponseDto,
} from '../../../users/username-check.dto';
import { UsersService } from '../../../users/users.service';
import { Username } from '../../../utils/username';
import { OpenApi } from '../../utils/openapi.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
  ) {
    this.logger.setContext(UsersController.name);
  }

  @Post('check')
  @HttpCode(200)
  @OpenApi(200)
  async checkUsername(
    @Body() usernameCheck: UsernameCheckDto,
  ): Promise<UsernameCheckResponseDto> {
    const userExists = await this.userService.checkIfUserExists(
      usernameCheck.username,
    );
    // TODO Check if username is blocked
    return { usernameAvailable: !userExists };
  }

  @Get('profile/:username')
  @OpenApi(200)
  async getUser(@Param('username') username: Username): Promise<UserInfoDto> {
    return this.userService.toUserDto(
      await this.userService.getUserByUsername(username),
    );
  }
}
