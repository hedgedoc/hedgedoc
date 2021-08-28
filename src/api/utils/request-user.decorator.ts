/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

import { User } from '../../users/user.entity';

/**
 * Extracts the {@link User} object from a request
 *
 * Will throw an {@link InternalServerErrorException} if no user is present
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequestUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & { user: User } = ctx.switchToHttp().getRequest();
    if (!request.user) {
      // We should have a user here, otherwise something is wrong
      throw new InternalServerErrorException(
        'Request is missing a user object',
      );
    }
    return request.user;
  },
);
