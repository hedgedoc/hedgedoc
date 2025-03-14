/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';

/**
 * This guard checks if a session is present.
 *
 * If there is a username in `request.session.username` it will try to get this user from the database and put it into `request.user`. See {@link RequestUser}.
 * If there is no `request.session.username`, but any PermissionLevel is configured, `request.session.authProvider` is set to `guest` to indicate a guest user.
 *
 * @throws UnauthorizedException
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly logger: ConsoleLoggerService) {
    this.logger.setContext(SessionGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const userId = request.session?.userId;
    const authProviderType = request.session?.authProviderType;
    if (!userId || !authProviderType) {
      this.logger.debug('The user has no session.');
      throw new UnauthorizedException("You're not logged in");
    }
    request.userId = userId;
    request.authProviderType = authProviderType;
    return true;
  }
}
