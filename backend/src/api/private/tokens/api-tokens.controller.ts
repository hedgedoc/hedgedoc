/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ApiTokenCreateDto,
  ApiTokenDto,
  ApiTokenWithSecretDto,
} from '@hedgedoc/commons';
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

import { ApiTokenService } from '../../../api-token/api-token.service';
import { SessionGuard } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { User } from '../../../users/user.entity';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUser } from '../../utils/request-user.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('tokens')
@Controller('tokens')
export class ApiTokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private publicAuthTokenService: ApiTokenService,
  ) {
    this.logger.setContext(ApiTokensController.name);
  }

  @Get()
  @OpenApi(200)
  async getUserTokens(@RequestUser() user: User): Promise<ApiTokenDto[]> {
    return (await this.publicAuthTokenService.getTokensByUser(user)).map(
      (token) => this.publicAuthTokenService.toAuthTokenDto(token),
    );
  }

  @Post()
  @OpenApi(201)
  async postTokenRequest(
    @Body() createDto: ApiTokenCreateDto,
    @RequestUser() user: User,
  ): Promise<ApiTokenWithSecretDto> {
    return await this.publicAuthTokenService.addToken(
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
    const tokens = await this.publicAuthTokenService.getTokensByUser(user);
    for (const token of tokens) {
      if (token.keyId == keyId) {
        return await this.publicAuthTokenService.removeToken(keyId);
      }
    }
    throw new UnauthorizedException(
      'User is not authorized to delete this token',
    );
  }
}
