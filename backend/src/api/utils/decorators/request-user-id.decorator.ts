/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { CompleteRequest } from '../request.type';

type RequestUserIdParameter = {
  forbidGuests: boolean;
};

/**
 * Trys to extract the {@link User.id} object from a request
 *
 * If a user is present in the request, returns the user object.
 * If no user is present and guests are allowed, returns `null`.
 * If no user is present and guests are not allowed, throws {@link UnauthorizedException}.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequestUserId = createParamDecorator(
  (
    data: RequestUserIdParameter = { forbidGuests: false },
    ctx: ExecutionContext,
  ) => {
    const request: CompleteRequest = ctx.switchToHttp().getRequest();
    if (
      !request.authProviderType ||
      (request.authProviderType === AuthProviderType.GUEST && data.forbidGuests)
    ) {
      throw new UnauthorizedException("You're not logged in");
    }
    return request.userId;
  },
);
