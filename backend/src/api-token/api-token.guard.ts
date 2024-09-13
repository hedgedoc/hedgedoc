/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { CompleteRequest } from '../api/utils/request.type';
import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { ApiTokenService } from './api-token.service';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private readonly apiTokenService: ApiTokenService,
  ) {
    this.logger.setContext(ApiTokenGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }
    const [method, token] = authHeader.trim().split(' ');
    if (method !== 'Bearer') {
      return false;
    }
    try {
      request.user = await this.apiTokenService.validateToken(token.trim());
      return true;
    } catch (error) {
      if (
        !(error instanceof TokenNotValidError || error instanceof NotInDBError)
      ) {
        this.logger.error(
          `Error during API token validation: ${String(error)}`,
          'canActivate',
        );
      }
      return false;
    }
  }
}
