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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiTokenService } from '../../../api-token/api-token.service';
import { SessionGuard } from '../../../auth/session.guard';
import { FieldNameUser, User } from '../../../database/types';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/openapi.decorator';
import { RequestUserInfo } from '../../utils/request-user-id.decorator';

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
  async getUserTokens(@RequestUserInfo() userId: number): Promise<ApiTokenDto[]> {
    return (await this.publicAuthTokenService.getTokensOfUserById(userId)).map(
      (token) => this.publicAuthTokenService.toAuthTokenDto(token),
    );
  }

  @Post()
  @OpenApi(201)
  async postTokenRequest(
    @Body() createDto: ApiTokenCreateDto,
    @RequestUserInfo() userId: User[FieldNameUser.id],
  ): Promise<ApiTokenWithSecretDto> {
    return await this.publicAuthTokenService.createToken(
      userId,
      createDto.label,
      createDto.validUntil,
    );
  }

  @Delete('/:keyId')
  @OpenApi(204, 404)
  async deleteToken(
    @RequestUserInfo() userId: number,
    @Param('keyId') keyId: string,
  ): Promise<void> {
    await this.publicAuthTokenService.removeToken(keyId, userId);
  }
}
