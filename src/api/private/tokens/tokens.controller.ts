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
    return (
      await this.usersService.getTokensByUsername('hardcoded')
    ).map((token) => this.usersService.toAuthTokenDto(token));
  }

  @Post()
  async postTokenRequest(
    @Body('label') label: string,
    @Body('until') until: number,
  ): Promise<AuthTokenWithSecretDto> {
    // ToDo: Get real userName
    const authToken = await this.usersService.createTokenForUser(
      'hardcoded',
      label,
      until,
    );
    return this.usersService.toAuthTokenWithSecretDto(authToken);
  }

  @Delete('/:keyId')
  @HttpCode(204)
  async deleteToken(@Param('keyId') keyId: string) {
    // ToDo: Get real userName
    return this.usersService.removeToken('hardcoded', keyId);
  }
}
