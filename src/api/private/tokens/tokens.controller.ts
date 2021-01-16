/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { UsersService } from '../../../users/users.service';
import { AuthTokenDto } from '../../../users/auth-token.dto';
import { AuthTokenWithSecretDto } from '../../../users/auth-token-with-secret.dto';

@Controller('tokens')
export class TokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private usersService: UsersService,
  ) {
    this.logger.setContext(TokensController.name);
  }

  @Get()
  async getUserTokens(): Promise<AuthTokenDto[]> {
    // ToDo: Get real userName
    return (await this.usersService.getTokensByUsername('molly')).map((token) =>
      this.usersService.toAuthTokenDto(token),
    );
  }

  @Post()
  async postToken(@Body() label: string): Promise<AuthTokenWithSecretDto> {
    // ToDo: Get real userName
    const authToken = await this.usersService.createTokenForUser(
      'hardcoded',
      label,
    );
    return this.usersService.toAuthTokenWithSecretDto(authToken);
  }

  @Delete('/:timestamp')
  @HttpCode(204)
  async deleteToken(@Param('timestamp') timestamp: number) {
    // ToDo: Get real userName
    return this.usersService.removeToken('hardcoded', timestamp);
  }
}
