/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

import { NotInDBError, TokenNotValidError } from '../errors/errors';
import { User } from '../users/user.entity';
import { PublicAuthTokenService } from './public-auth-token.service';

@Injectable()
export class PublicAuthTokenGuard extends AuthGuard('token') {}

@Injectable()
export class PublicAuthTokenStrategy extends PassportStrategy(
  Strategy,
  'token',
) {
  constructor(private authService: PublicAuthTokenService) {
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
