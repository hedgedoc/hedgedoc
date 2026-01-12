/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExecutionContext, Injectable } from '@nestjs/common';

import { UsersService } from '../../../users/users.service';
import { CompleteRequest } from '../request.type';

@Injectable()
export class MockApiTokenGuard {
  private userId: number;

  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: CompleteRequest = context.switchToHttp().getRequest();
    if (!this.userId) {
      // this assures that we can create the user 'hardcoded', if we need them before any calls are made or
      // create them on the fly when the first call to the api is made
      try {
        this.userId = await this.usersService.getUserIdByUsername('hardcoded');
      } catch {
        this.userId = await this.usersService.createUser('hardcoded', 'Testy', null, null);
      }
    }
    req.userId = this.userId;
    return true;
  }
}
