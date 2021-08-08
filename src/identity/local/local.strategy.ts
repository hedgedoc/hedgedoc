/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { NotInDBError } from '../../errors/errors';
import { UserRelationEnum } from '../../users/user-relation.enum';
import { User } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { IdentityService } from '../identity.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private userService: UsersService,
    private identityService: IdentityService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    try {
      const user = await this.userService.getUserByUsername(username, [
        UserRelationEnum.IDENTITIES,
      ]);
      await this.identityService.loginWithLocalIdentity(user, password);
      return user;
    } catch (e) {
      if (e instanceof NotInDBError) {
        throw new UnauthorizedException(
          'This username and password combination did not work.',
        );
      }
      throw e;
    }
  }
}
