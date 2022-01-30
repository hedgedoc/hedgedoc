/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { buildErrorMessage, parseOptionalInt, toArrayConfig } from './utils';

export interface NoteConfig {
  forbiddenNoteIds: string[];
  maxDocumentLength: number;
}

const schema = Joi.object({
  forbiddenNoteIds: Joi.array()
    .items(Joi.string())
    .optional()
    .default([])
    .label('HD_FORBIDDEN_NOTE_IDS'),
  maxDocumentLength: Joi.number()
    .default(100000)
    .optional()
    .label('HD_MAX_DOCUMENT_LENGTH'),
});

export default registerAs('noteConfig', () => {
  const noteConfig = schema.validate(
    {
      forbiddenNoteIds: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS, ','),
      maxDocumentLength: parseOptionalInt(process.env.HD_MAX_DOCUMENT_LENGTH),
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (noteConfig.error) {
    const errorMessages = noteConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return noteConfig.value as NoteConfig;
});
