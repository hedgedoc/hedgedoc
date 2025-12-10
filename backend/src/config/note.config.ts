/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  PermissionLevel,
  PermissionLevelNames,
  PermissionLevelValues,
} from '@hedgedoc/commons';
import { registerAs } from '@nestjs/config';
import z from 'zod';

import {
  parseOptionalNumber,
  printConfigErrorAndExit,
  toArrayConfig,
} from './utils';
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
  permissions: z.object({
    maxGuestLevel: z
      .enum(PermissionLevelNames)
      .optional()
      .default(PermissionLevelNames[PermissionLevel.FULL])
      .describe('HD_PERMISSIONS_MAX_GUEST_LEVEL')
      .transform((value) => PermissionLevelValues[value]),
    default: z.object({
      everyone: z
        .enum(PermissionLevelNames)
        .optional()
        .default(PermissionLevelNames[PermissionLevel.READ])
        .describe('HD_PERMISSIONS_DEFAULT_EVERYONE')
        .refine((value) => {
          // The PermissionLevel.FULL is reserved for owner permissions in the note context and is therefore forbidden
          return value !== PermissionLevelNames[PermissionLevel.FULL];
        })
        .transform((value) => PermissionLevelValues[value]),
      loggedIn: z
        .enum(PermissionLevelNames)
        .optional()
        .default(PermissionLevelNames[PermissionLevel.WRITE])
        .describe('HD_PERMISSIONS_DEFAULT_LOGGED_IN')
        .refine((value) => {
          // The PermissionLevel.FULL is reserved for owner permissions in the note context and is therefore forbidden
          return value !== PermissionLevelNames[PermissionLevel.FULL];
        })
        .transform((value) => PermissionLevelValues[value]),
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
 * Checks if the default permissions for logged-in users are higher than those for guests
 *
 * If the default permissions for 'everyone' are set to a level that is higher than
 * the default permissions for 'loggedIn', it throws an error
 *
 * @param config The NoteConfig to check
 * @throws Error if the default permissions for 'everyone' are higher than those for 'loggedIn'
 */
function checkDefaultPermissions(config: NoteConfig): void {
  const everyone = config.permissions.default.everyone;
  const loggedIn = config.permissions.default.loggedIn;
  if (everyone > loggedIn) {
    throw new Error(
      `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[everyone]}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${PermissionLevelNames[loggedIn]}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
    );
  }
}

/**
 * Checks if the maximum guest level is not lower than the default permissions for 'everyone'
 *
 * If the default permissions for 'everyone' are set to a level that is higher than
 * the maximum guest level, it throws an error
 *
 * @param config The NoteConfig to check
 * @throws Error if the default permissions for 'everyone' are higher than the maximum guest level
 */
function checkMaxGuestLevel(config: NoteConfig): void {
  const maxGuestLevel = config.permissions.maxGuestLevel;
  const defaultEveryoneLevel = config.permissions.default.everyone;
  if (defaultEveryoneLevel > maxGuestLevel) {
    throw new Error(
      `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[defaultEveryoneLevel]}', but 'HD_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[maxGuestLevel]}'. This does not work since the default level may not be higher than the maximum guest level.`,
    );
  }
}

export default registerAs('noteConfig', () => {
  const noteConfig = schema.safeParse({
    forbiddenNoteIds: toArrayConfig(process.env.HD_FORBIDDEN_NOTE_IDS, ','),
    maxDocumentLength: parseOptionalNumber(process.env.HD_MAX_DOCUMENT_LENGTH),
    permissions: {
      maxGuestLevel: process.env.HD_PERMISSIONS_MAX_GUEST_LEVEL,
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
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  const config = noteConfig.data;
  checkDefaultPermissions(config);
  checkMaxGuestLevel(config);
  return config;
});
