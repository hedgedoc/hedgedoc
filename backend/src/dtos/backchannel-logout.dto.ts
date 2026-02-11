/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { BackchannelLogoutSchema } from '@hedgedoc/commons';
import { createZodDto } from 'nestjs-zod';

export class BackchannelLogoutDto extends createZodDto(BackchannelLogoutSchema) {}
