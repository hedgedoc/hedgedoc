/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { forbiddenDescription, notFoundDescription } from './descriptions';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FullApi = applyDecorators(
  ApiForbiddenResponse({ description: forbiddenDescription }),
  ApiNotFoundResponse({ description: notFoundDescription }),
  ApiUnauthorizedResponse({ description: forbiddenDescription }),
);
