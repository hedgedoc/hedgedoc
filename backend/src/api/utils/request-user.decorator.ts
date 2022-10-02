/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { User } from '../../users/user.entity';

type RequestUserParameter = {
  guestsAllowed: boolean;
};

/**
 * Trys to extract the {@link User} object from a request
 *
 * If a user is present in the request, returns the user object.
 * If no user is present and guests are allowed, returns `null`.
 * If no user is present and guests are not allowed, throws {@link UnauthorizedException}.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequestUser = createParamDecorator(
  (
    data: RequestUserParameter = { guestsAllowed: false },
    ctx: ExecutionContext,
  ) => {
    const request: Request & { user: User | null } = ctx
      .switchToHttp()
      .getRequest();
    if (!request.user) {
      if (data.guestsAllowed) {
        return null;
      }
      throw new UnauthorizedException("You're not logged in");
    }
    return request.user;
  },
);
