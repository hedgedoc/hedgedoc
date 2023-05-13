/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { UserInfoDto } from '../../../users/user-info.dto';
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

  @Get(':username')
  @OpenApi(200)
  async getUser(@Param('username') username: Username): Promise<UserInfoDto> {
    return this.userService.toUserDto(
      await this.userService.getUserByUsername(username),
    );
  }
}
