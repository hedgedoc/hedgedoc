/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiTokenWithSecretSchema } from '@hedgedoc/commons';
import { createZodDto } from 'nestjs-zod';

export class ApiTokenWithSecretDto extends createZodDto(
  ApiTokenWithSecretSchema,
) {}
