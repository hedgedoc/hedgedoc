/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';

/**
 * This guard checks if a session is present.
 *
 * It checks if the session contains a `userId` and an `authProviderType`. If both are present, they are added to the request object.
 * Otherwise, an `UnauthorizedException` is thrown.
 *
 * @throws UnauthorizedException if the session is not present or does not contain a `userId` or `authProviderType`.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(SessionGuard.name);
  }

  /**
   * Checks if the request has a valid session.
   *
   * @param context The execution context containing the request.
   * @returns true if the session is valid
   * @throws UnauthorizedException when the session is invalid, and therefore stops further execution
   */
  canActivate(context: ExecutionContext): boolean {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const userId = request.session?.userId;
    const authProviderType = request.session?.authProviderType;
    if (!userId || !authProviderType) {
      this.logger.debug('The user has no session.');
      throw new UnauthorizedException('You have no active session');
    }
    request.userId = userId;
    request.authProviderType = authProviderType;
    return true;
  }
}
