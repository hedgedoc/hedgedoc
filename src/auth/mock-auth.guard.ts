/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class MockAuthGuard {
  private user: User;
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    if (!this.user) {
      this.user = await this.usersService.createUser('hardcoded', 'Testy');
    }
    req.user = this.user;
    return true;
  }
}
