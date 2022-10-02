/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class TokenAuthGuard extends AuthGuard('token') {}

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy, 'token') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<User> {
    try {
      return await this.authService.validateToken(token);
    } catch (error) {
      if (
        error instanceof NotInDBError ||
        error instanceof TokenNotValidError
      ) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
