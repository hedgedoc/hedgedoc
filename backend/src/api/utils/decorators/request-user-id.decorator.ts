/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { CompleteRequest } from '../request.type';

type RequestUserIdParameter = {
  forbidGuests?: boolean;
  allowAnonymous?: boolean;
};

/**
 * Trys to extract the {@link User.id} object from a request
 *
 * If a user is present in the request, returns the user object.
 * If no user is present and guests are allowed, returns `null`.
 * If no user is present and guests are not allowed, throws {@link UnauthorizedException}.
 * If no user is present and `allowAnonymous` is true, returns `null` without throwing.
 */
// oxlint-disable-next-line @typescript-eslint/naming-convention
export const RequestUserId = createParamDecorator(
  (
    data: RequestUserIdParameter = { forbidGuests: false, allowAnonymous: false },
    ctx: ExecutionContext,
  ) => {
    const request: CompleteRequest = ctx.switchToHttp().getRequest();
    // The session is always present (the session middleware runs for every
    // request); fall back to it so that this decorator works even when no
    // guard has populated `request.userId` yet.
    const userId = request.userId ?? request.session?.userId ?? null;
    const authProviderType = request.authProviderType ?? request.session?.loginAuthProviderType;
    if (!authProviderType || (authProviderType === AuthProviderType.GUEST && data.forbidGuests)) {
      if (data.allowAnonymous) {
        return null;
      }
      throw new UnauthorizedException("You're not logged in");
    }
    return userId;
  },
);
