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
import { FieldNameUser, User } from '@hedgedoc/database';
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
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';
import { RequestUserId } from '../../utils/decorators/request-user-id.decorator';

@UseGuards(SessionGuard)
@OpenApi(401)
@ApiTags('tokens')
@Controller('tokens')
export class ApiTokensController {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private apiTokenService: ApiTokenService,
  ) {
    this.logger.setContext(ApiTokensController.name);
  }

  @Get()
  @OpenApi(200)
  async getUserTokens(
    @RequestUserId({ forbidGuests: true }) userId: number,
  ): Promise<ApiTokenDto[]> {
    return (await this.apiTokenService.getTokensOfUserById(userId)).map(
      (token) => this.apiTokenService.toAuthTokenDto(token),
    );
  }

  @Post()
  @OpenApi(201)
  async postTokenRequest(
    @Body() createDto: ApiTokenCreateDto,
    @RequestUserId({ forbidGuests: true }) userId: User[FieldNameUser.id],
  ): Promise<ApiTokenWithSecretDto> {
    return await this.apiTokenService.createToken(
      userId,
      createDto.label,
      createDto.validUntil,
    );
  }

  @Delete('/:keyId')
  @OpenApi(204, 404)
  async deleteToken(
    @RequestUserId({ forbidGuests: true }) userId: number,
    @Param('keyId') keyId: string,
  ): Promise<void> {
    await this.apiTokenService.removeToken(keyId, userId);
  }
}
