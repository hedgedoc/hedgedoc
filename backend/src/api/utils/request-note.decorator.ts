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

import { CompleteRequest } from './request.type';

/**
 * Extracts the {@link Note} object from a request
 *
 * Will throw an {@link InternalServerErrorException} if no note is present
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequestNote = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: CompleteRequest = ctx.switchToHttp().getRequest();
    if (!request.note) {
      // We should have a note here, otherwise something is wrong
      throw new InternalServerErrorException(
        'Request is missing a note object',
      );
    }
    return request.note;
  },
);
