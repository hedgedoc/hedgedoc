/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { buildErrorMessage, extractDescriptionFromZodIssue } from './zod-error-message';
import { printConfigErrorAndExit } from './utils';

const scimConfigSchema = z.object({
  bearerToken: z.string().min(1).optional().describe('HD_SCIM_BEARER_TOKEN'),
  providerIdentifier: z.string().min(1).default('scim').describe('HD_SCIM_PROVIDER_IDENTIFIER'),
});

export type ScimConfig = z.infer<typeof scimConfigSchema>;

export default registerAs('scimConfig', () => {
  const scimConfig = scimConfigSchema.safeParse({
    bearerToken: process.env.HD_SCIM_BEARER_TOKEN,
    providerIdentifier: process.env.HD_SCIM_PROVIDER_IDENTIFIER,
  });

  if (scimConfig.error) {
    const errorMessages = scimConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_SCIM'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return scimConfig.data;
});
