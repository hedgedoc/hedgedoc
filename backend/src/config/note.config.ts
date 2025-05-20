/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { registerAs } from '@nestjs/config';
import z from 'zod';

import {
  DefaultAccessLevel,
  getDefaultAccessLevelOrdinal,
} from './default-access-level.enum';
import { parseOptionalNumber, toArrayConfig } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const schema = z.object({
  forbiddenNoteIds: z
    .array(z.string().min(1))
    .optional()
    .default([])
    .describe('HD_FORBIDDEN_NOTE_IDS'),
  maxDocumentLength: z
    .number()
    .int()
    .positive()
    .optional()
    .default(100000)
    .describe('HD_MAX_DOCUMENT_LENGTH'),
  guestAccess: z
    .nativeEnum(PermissionLevel)
    .optional()
    .default(PermissionLevel.WRITE)
    .describe('HD_GUEST_ACCESS'),
  permissions: z.object({
    default: z.object({
      everyone: z
        .nativeEnum(DefaultAccessLevel)
        .optional()
        .default(DefaultAccessLevel.READ)
        .describe('HD_PERMISSIONS_DEFAULT_EVERYONE'),
      loggedIn: z
        .nativeEnum(DefaultAccessLevel)
        .optional()
        .default(DefaultAccessLevel.WRITE)
        .describe('HD_PERMISSIONS_DEFAULT_LOGGED_IN'),
    }),
  }),
  revisionRetentionDays: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0)
    .describe('HD_REVISION_RETENTION_DAYS'),
});

export type NoteConfig = z.infer<typeof schema>;

/**
 * Checks if the configuration for guest access is consistent with the environment variable
 * HD_PERMISSIONS_DEFAULT_EVERYONE.
 *
 * If HD_PERMISSIONS_DEFAULT_EVERYONE is set, it should not conflict with the guestAccess setting.
 * If guestAccess is DENY, then HD_PERMISSIONS_DEFAULT_EVERYONE should not be set.
 *
 * @param config The NoteConfig to check.
 * @throws Error if the configuration is inconsistent.
 */
function checkEveryoneConfigIsConsistent(config: NoteConfig): void {
  const everyoneDefaultSet =
    process.env.HD_PERMISSIONS_DEFAULT_EVERYONE !== undefined;
  if (config.guestAccess === PermissionLevel.DENY && everyoneDefaultSet) {
    throw new Error(
      `'HD_GUEST_ACCESS' is set to '${config.guestAccess}', but 'HD_PERMISSIONS_DEFAULT_EVERYONE' is also configured. Please remove 'HD_PERMISSIONS_DEFAULT_EVERYONE'.`,
    );
  }
}

/**
 * Checks if the default permissions for logged-in users are higher than those for guests.
 *
 * If the default permissions for 'everyone' are set to a level that is higher than
 * the default permissions for 'loggedIn', it throws an error.
 *
 * @param config The NoteConfig to check.
 * @throws Error if the default permissions for 'everyone' are higher than those for 'loggedIn'.
 */
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
      `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${everyone}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${loggedIn}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
    );
  }
}

export default registerAs('noteConfig', () => {
  const noteConfig = schema.safeParse({
    forbiddenNoteIds: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS, ','),
    maxDocumentLength: parseOptionalNumber(process.env.HD_MAX_DOCUMENT_LENGTH),
    guestAccess: process.env.HD_GUEST_ACCESS,
    permissions: {
      default: {
        everyone: process.env.HD_PERMISSIONS_DEFAULT_EVERYONE,
        loggedIn: process.env.HD_PERMISSIONS_DEFAULT_LOGGED_IN,
      },
    },
    revisionRetentionDays: parseOptionalNumber(
      process.env.HD_REVISION_RETENTION_DAYS,
    ),
  });
  if (noteConfig.error) {
    const errorMessages = noteConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD'),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  const config = noteConfig.data;
  checkEveryoneConfigIsConsistent(config);
  checkLoggedInUsersHaveHigherDefaultPermissionsThanGuests(config);
  return config;
});
