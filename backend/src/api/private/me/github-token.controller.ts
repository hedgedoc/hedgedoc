/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SessionGuard, RequestWithSession } from '../../../auth/session.guard';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { OpenApi } from '../../utils/decorators/openapi.decorator';

export interface GithubTokenResponseDto {
  hasToken: boolean;
  token?: string;
}

@UseGuards(SessionGuard)
@OpenApi()
@ApiTags('me')
@Controller('me/github-token')
export class GithubTokenController {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(GithubTokenController.name);
  }

  @Get()
  @OpenApi()
  getGithubToken(@Req() request: RequestWithSession): GithubTokenResponseDto {
    const token = request.session?.githubAccessToken;

    if (token) {
      this.logger.debug(
        'GitHub access token retrieved from session for sync functionality',
        'getGithubToken',
      );
      return {
        hasToken: true,
        token: token,
      };
    }

    return { hasToken: false };
  }
}
