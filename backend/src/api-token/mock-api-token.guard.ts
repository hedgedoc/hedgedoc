/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExecutionContext, Injectable } from '@nestjs/common';

import { CompleteRequest } from '../api/utils/request.type';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class MockApiTokenGuard {
  private user: User;

  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CompleteRequest = context.switchToHttp().getRequest();
    if (!this.user) {
      // this assures that we can create the user 'hardcoded', if we need them before any calls are made or
      // create them on the fly when the first call to the api is made
      try {
        this.user = await this.usersService.getUserByUsername('hardcoded');
      } catch (e) {
        this.user = await this.usersService.createUser(
          'hardcoded',
          'Testy',
          null,
          null,
        );
      }
    }
    req.user = this.user;
    return true;
  }
}
