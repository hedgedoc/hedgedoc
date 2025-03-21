/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess } from '@hedgedoc/commons';
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import {
  DefaultAccessLevel,
  getDefaultAccessLevelOrdinal,
} from './default-access-level.enum';
import { buildErrorMessage, parseOptionalNumber, toArrayConfig } from './utils';

export interface NoteConfig {
  forbiddenNoteIds: string[];
  maxDocumentLength: number;
  guestAccess: GuestAccess;
  permissions: {
    default: {
      everyone: DefaultAccessLevel;
      loggedIn: DefaultAccessLevel;
    };
  };
  revisionRetentionDays: number;
}

const schema = Joi.object<NoteConfig>({
  forbiddenNoteIds: Joi.array()
    .items(Joi.string())
    .optional()
    .default([])
    .label('HD_FORBIDDEN_NOTE_IDS'),
  maxDocumentLength: Joi.number()
    .default(100000)
    .positive()
    .integer()
    .optional()
    .label('HD_MAX_DOCUMENT_LENGTH'),
  guestAccess: Joi.string()
    .valid(...Object.values(GuestAccess))
    .optional()
    .default(GuestAccess.WRITE)
    .label('HD_GUEST_ACCESS'),
  permissions: {
    default: {
      everyone: Joi.string()
        .valid(...Object.values(DefaultAccessLevel))
        .optional()
        .default(DefaultAccessLevel.READ)
        .label('HD_PERMISSION_DEFAULT_EVERYONE'),
      loggedIn: Joi.string()
        .valid(...Object.values(DefaultAccessLevel))
        .optional()
        .default(DefaultAccessLevel.WRITE)
        .label('HD_PERMISSION_DEFAULT_LOGGED_IN'),
    },
  },
  revisionRetentionDays: Joi.number()
    .integer()
    .default(0)
    .min(0)
    .optional()
    .label('HD_REVISION_RETENTION_DAYS'),
});

function checkEveryoneConfigIsConsistent(config: NoteConfig): void {
  const everyoneDefaultSet =
    process.env.HD_PERMISSION_DEFAULT_EVERYONE !== undefined;
  if (config.guestAccess === GuestAccess.DENY && everyoneDefaultSet) {
    throw new Error(
      `'HD_GUEST_ACCESS' is set to '${config.guestAccess}', but 'HD_PERMISSION_DEFAULT_EVERYONE' is also configured. Please remove 'HD_PERMISSION_DEFAULT_EVERYONE'.`,
    );
  }
}

function checkLoggedInUsersHaveHigherDefaultPermissionsThanGuests(
  config: NoteConfig,
): void {
  const everyone = config.permissions.default.everyone;
  const loggedIn = config.permissions.default.loggedIn;
  if (
    getDefaultAccessLevelOrdinal(everyone) >
    getDefaultAccessLevelOrdinal(loggedIn)
  ) {
    throw new Error(
      `'HD_PERMISSION_DEFAULT_EVERYONE' is set to '${everyone}', but 'HD_PERMISSION_DEFAULT_LOGGED_IN' is set to '${loggedIn}'. This gives everyone greater permissions than logged-in users which is not allowed.`,
    );
  }
}

export default registerAs('noteConfig', () => {
  const noteConfig = schema.validate(
    {
      forbiddenNoteIds: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS, ','),
      maxDocumentLength: parseOptionalNumber(
        process.env.HD_MAX_DOCUMENT_LENGTH,
      ),
      guestAccess: process.env.HD_GUEST_ACCESS,
      permissions: {
        default: {
          everyone: process.env.HD_PERMISSION_DEFAULT_EVERYONE,
          loggedIn: process.env.HD_PERMISSION_DEFAULT_LOGGED_IN,
        },
      },
      revisionRetentionDays: parseOptionalNumber(
        process.env.HD_REVISION_RETENTION_DAYS,
      ),
    } as NoteConfig,
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
  const config = noteConfig.value;
  checkEveryoneConfigIsConsistent(config);
  checkLoggedInUsersHaveHigherDefaultPermissionsThanGuests(config);
  return config;
});
