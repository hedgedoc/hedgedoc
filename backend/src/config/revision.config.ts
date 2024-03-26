/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { buildErrorMessage, parseOptionalNumber } from './utils';

export interface RevisionConfig {
  retentionDays: number;
}

const schema = Joi.object({
  retentionDays: Joi.number()
    .integer()
    .default(0)
    .min(0)
    .optional()
    .label('HD_REVISION_RETENTION_DAYS'),
});

export default registerAs('revisionConfig', () => {
  const revisionConfig = schema.validate(
    {
      retentionDays: parseOptionalNumber(
        process.env.HD_REVISION_RETENTION_DAYS,
      ),
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (revisionConfig.error) {
    const errorMessages = revisionConfig.error.details.map(
      (detail) => detail.message,
    );
    console.log(errorMessages);

    throw new Error(buildErrorMessage(errorMessages));
  }
  return revisionConfig.value as RevisionConfig;
});
