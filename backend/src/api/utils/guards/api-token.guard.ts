/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ApiTokenService } from '../../../api-token/api-token.service';
import { NotInDBError, TokenNotValidError } from '../../../errors/errors';
import { ConsoleLoggerService } from '../../../logger/console-logger.service';
import { CompleteRequest } from '../request.type';

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
      request.userId = await this.apiTokenService.getUserIdForToken(token.trim());
      request.authProviderType = AuthProviderType.TOKEN;
      return true;
    } catch (error) {
      if (!(error instanceof TokenNotValidError || error instanceof NotInDBError)) {
        this.logger.error(
          `Unknown Error during API token validation: ${String(error)}`,
          undefined,
          'canActivate',
        );
      }
      return false;
    }
  }
}
