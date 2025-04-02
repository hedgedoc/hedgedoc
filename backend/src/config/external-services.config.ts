/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const schema = z.object({
  plantumlServer: z.string().url().or(z.null()).describe('HD_PLANTUML_SERVER'),
  imageProxy: z.string().url().or(z.null()).describe('HD_IMAGE_PROXY'),
});

export type ExternalServicesConfig = z.infer<typeof schema>;

export default registerAs('externalServicesConfig', () => {
  if (process.env.HD_IMAGE_PROXY !== undefined) {
    throw new Error(
      "HD_IMAGE_PROXY is currently not yet supported. Please don't configure it",
    );
  }
  const externalConfig = schema.safeParse({
    plantumlServer: process.env.HD_PLANTUML_SERVER ?? null,
    imageProxy: process.env.HD_IMAGE_PROXY ?? null,
  });
  if (externalConfig.error) {
    const errorMessages = externalConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return externalConfig.data;
});
