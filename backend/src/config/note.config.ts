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
  parseOptionalBoolean,
  parseOptionalNumber,
  printConfigErrorAndExit,
  toArrayConfig,
} from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

const schema = z
  .object({
    forbiddenAliases: z
      .array(z.string().min(1))
      .optional()
      .default([])
      .describe('HD_NOTE_FORBIDDEN_ALIASES'),
    maxLength: z
      .number()
      .int()
      .positive()
      .optional()
      .default(100000)
      .describe('HD_NOTE_MAX_LENGTH'),
    permissions: z.object({
      maxGuestLevel: z
        .enum(PermissionLevelNames)
        .optional()
        .default(PermissionLevelNames[PermissionLevel.FULL])
        .describe('HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL')
        .transform((value) => PermissionLevelValues[value]),
      default: z.object({
        everyone: z
          .enum(PermissionLevelNames)
          .optional()
          .default(PermissionLevelNames[PermissionLevel.READ])
          .describe('HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE')
          .refine((value) => {
            // The PermissionLevel.FULL is reserved for owner permissions in the note context and is therefore forbidden
            return value !== PermissionLevelNames[PermissionLevel.FULL];
          })
          .transform((value) => PermissionLevelValues[value]),
        loggedIn: z
          .enum(PermissionLevelNames)
          .optional()
          .default(PermissionLevelNames[PermissionLevel.WRITE])
          .describe('HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN')
          .refine((value) => {
            // The PermissionLevel.FULL is reserved for owner permissions in the note context and is therefore forbidden
            return value !== PermissionLevelNames[PermissionLevel.FULL];
          })
          .transform((value) => PermissionLevelValues[value]),
        publiclyVisible: z
          .boolean()
          .default(false)
          .describe('HD_NOTE_PERMISSIONS_DEFAULT_PUBLICLY_VISIBLE'),
      }),
    }),
    revisionRetentionDays: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(0)
      .describe('HD_NOTE_REVISION_RETENTION_DAYS'),
    persistInterval: z.coerce
      .number()
      .int()
      .min(0)
      .default(10)
      .describe('HD_NOTE_PERSIST_INTERVAL'),
  })
  .superRefine((config, ctx) => {
    const defaultEveryone = config.permissions.default.everyone;
    const defaultLoggedIn = config.permissions.default.loggedIn;
    const maxGuestLevel = config.permissions.maxGuestLevel;
    if (
      maxGuestLevel === PermissionLevel.FULL &&
      defaultEveryone !== PermissionLevel.WRITE
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[maxGuestLevel]}', but 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[defaultEveryone]}'. This does not allow the guest users to write in the notes they can create.`,
        fatal: true,
      });
    }
    if (defaultEveryone > maxGuestLevel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[defaultEveryone]}', but 'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[maxGuestLevel]}'. This does not work since the default level may not be higher than the maximum guest level.`,
        fatal: true,
      });
    }
    if (defaultEveryone > defaultLoggedIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[defaultEveryone]}', but 'HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${PermissionLevelNames[defaultLoggedIn]}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
        fatal: true,
      });
    }
  });

export type NoteConfig = z.infer<typeof schema>;

export default registerAs('noteConfig', () => {
  const noteConfig = schema.safeParse({
    forbiddenAliases: toArrayConfig(process.env.HD_NOTE_FORBIDDEN_ALIASES, ','),
    maxLength: parseOptionalNumber(process.env.HD_NOTE_MAX_LENGTH),
    permissions: {
      maxGuestLevel: process.env.HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL,
      default: {
        everyone: process.env.HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE,
        loggedIn: process.env.HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN,
        publiclyVisible: parseOptionalBoolean(
          process.env.HD_NOTE_PERMISSIONS_DEFAULT_PUBLICLY_VISIBLE,
        ),
      },
    },
    revisionRetentionDays: parseOptionalNumber(
      process.env.HD_NOTE_REVISION_RETENTION_DAYS,
    ),
    persistInterval: parseOptionalNumber(process.env.HD_NOTE_PERSIST_INTERVAL),
  });
  if (noteConfig.error) {
    const errorMessages = noteConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_NOTE'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return noteConfig.data;
});
