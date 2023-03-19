/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

import { SessionState } from '../../session/session.service';

/**
 * Extracts the auth provider identifier from a session inside a request
 *
 * Will throw an {@link InternalServerErrorException} if no identifier is present
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SessionAuthProvider = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request & {
      session: SessionState;
    } = ctx.switchToHttp().getRequest();
    if (!request.session?.authProvider) {
      // We should have an auth provider here, otherwise something is wrong
      throw new InternalServerErrorException(
        'Session is missing an auth provider identifier',
      );
    }
    return request.session.authProvider;
  },
);
