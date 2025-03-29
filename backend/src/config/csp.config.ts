/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as process from 'node:process';
import z from 'zod';

import { parseOptionalBoolean } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const cspSchema = z.object({
  enable: z.boolean().default(true).describe('HD_CSP_ENABLED'),
  reportURI: z.string().optional().describe('HD_CSP_REPORT_URI'),
});

export type CspConfig = z.infer<typeof cspSchema>;

export default registerAs('cspConfig', () => {
  if (
    process.env.HD_CSP_ENABLE !== undefined ||
    process.env.HD_CSP_REPORT_URI !== undefined
  ) {
    throw new Error(
      "CSP config is currently not yet supported. Please don't configure it",
    );
  }

  const cspConfig = cspSchema.safeParse({
    enable: parseOptionalBoolean(process.env.HD_CSP_ENABLED),
    reportURI: process.env.HD_CSP_REPORT_URI,
  });
  if (cspConfig.error) {
    const errorMessages = cspConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_CSP'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return cspConfig.data;
});
