/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CompleteRequest } from '../api/utils/request.type';
import { GuestAccess } from '../config/guest_access.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UsersService } from '../users/users.service';

/**
 * This guard checks if a session is present.
 *
 * If there is a username in `request.session.username` it will try to get this user from the database and put it into `request.user`. See {@link RequestUser}.
 * If there is no `request.session.username`, but any GuestAccess is configured, `request.session.authProvider` is set to `guest` to indicate a guest user.
 *
 * @throws UnauthorizedException
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
  ) {
    this.logger.setContext(SessionGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: CompleteRequest = context.switchToHttp().getRequest();
    const username = request.session?.username;
    if (!username) {
      if (this.noteConfig.guestAccess !== GuestAccess.DENY && request.session) {
        request.session.authProvider = 'guest';
        return true;
      }
      this.logger.debug('The user has no session.');
      throw new UnauthorizedException("You're not logged in");
    }
    try {
      request.user = await this.userService.getUserByUsername(username);
      return true;
    } catch (e) {
      if (e instanceof NotInDBError) {
        this.logger.debug(
          `The user '${username}' does not exist, but has a session.`,
        );
        throw new UnauthorizedException("You're not logged in");
      }
      throw e;
    }
  }
}
