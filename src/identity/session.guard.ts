/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
  ) {
    this.logger.setContext(SessionGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request & { session?: { user: string }; user?: User } =
      context.switchToHttp().getRequest();
    if (!request.session) {
      this.logger.debug('The user has no session.');
      throw new UnauthorizedException("You're not logged in");
    }
    try {
      request.user = await this.userService.getUserByUsername(
        request.session.user,
      );
      return true;
    } catch (e) {
      if (e instanceof NotInDBError) {
        this.logger.debug(
          `The user '${request.session.user}' does not exist, but has a session.`,
        );
        throw new UnauthorizedException("You're not logged in");
      }
      throw e;
    }
  }
}
