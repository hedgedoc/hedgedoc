/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AliasUpdateSchema } from '@hedgedoc/commons';
import { createZodDto } from 'nestjs-zod';

export class AliasUpdateDto extends createZodDto(AliasUpdateSchema) {}
