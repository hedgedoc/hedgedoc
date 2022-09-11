/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  AuthTokenCreateDto,
  AuthTokenDto,
  AuthTokenWithSecretDto,
} from '../../../auth/auth-token.dto';
import { AuthService } from '../../../auth/auth.service';
import { SessionGuard } from '../../../identity/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { User } from '../../../users/user.entity';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private authService: AuthService,
  ) {
    this.logger.setContext(TokensController.name);
  }

  @Get()
  @OpenApi(200)
  async getUserTokens(@RequestUser() user: User): Promise<AuthTokenDto[]> {
    return (await this.authService.getTokensByUser(user)).map((token) =>
      this.authService.toAuthTokenDto(token),
    );
  }

  @Post()
  @OpenApi(201)
  async postTokenRequest(
    @Body() createDto: AuthTokenCreateDto,
    @RequestUser() user: User,
  ): Promise<AuthTokenWithSecretDto> {
    return await this.authService.addToken(
      user,
      createDto.label,
      createDto.validUntil,
    );
  }

  @Delete('/:keyId')
  @OpenApi(204, 404)
  async deleteToken(
    @RequestUser() user: User,
    @Param('keyId') keyId: string,
  ): Promise<void> {
    const tokens = await this.authService.getTokensByUser(user);
    for (const token of tokens) {
      if (token.keyId == keyId) {
        return await this.authService.removeToken(keyId);
      }
    }
    throw new UnauthorizedException(
      'User is not authorized to delete this token',
    );
  }
}
