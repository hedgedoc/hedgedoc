/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { CompleteRequest } from '../request.type';

/**
 * Extracts the {@link Note} object from a request
 *
 * Will throw an {@link InternalServerErrorException} if no note is present
 */
// oxlint-disable-next-line @typescript-eslint/naming-convention
export const RequestNoteId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: CompleteRequest = ctx.switchToHttp().getRequest();
  if (!request.noteId) {
    // We should have a note here, otherwise something is wrong
    throw new InternalServerErrorException('Request is missing a noteId');
  }
  return request.noteId;
});
