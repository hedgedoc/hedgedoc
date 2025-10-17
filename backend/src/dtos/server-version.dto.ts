/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ServerVersionSchema } from '@hedgedoc/commons';
import { createZodDto } from 'nestjs-zod';

export class ServerVersionDto extends createZodDto(ServerVersionSchema) {}
