/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { NotInDBError, TokenNotValidError } from '../errors/errors';

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
