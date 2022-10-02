/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import {
  InvalidCredentialsError,
  NoLocalIdentityError,
} from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { UserRelationEnum } from '../../users/user-relation.enum';
import { User } from '../../users/user.entity';
import { UsersService } from '../../users/users.service';
import { IdentityService } from '../identity.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private userService: UsersService,
    private identityService: IdentityService,
  ) {
    super();
    logger.setContext(LocalStrategy.name);
  }

  async validate(username: string, password: string): Promise<User> {
    try {
      const user = await this.userService.getUserByUsername(username, [
        UserRelationEnum.IDENTITIES,
      ]);
      await this.identityService.checkLocalPassword(user, password);
      return user;
    } catch (e) {
      if (
        e instanceof InvalidCredentialsError ||
        e instanceof NoLocalIdentityError
      ) {
        this.logger.log(
          `User with username '${username}' could not log in. Reason: ${e.name}`,
        );
        throw new UnauthorizedException(
          'This username and password combination is not valid.',
        );
      }
      throw e;
    }
  }
}
