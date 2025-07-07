/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { NoteConfig } from '../note.config';

export function createDefaultMockNoteConfig(): NoteConfig {
  return {
    maxDocumentLength: 100000,
    forbiddenNoteIds: ['forbiddenNoteId'],
    permissions: {
      maxGuestLevel: PermissionLevel.FULL,
      default: {
        everyone: PermissionLevel.READ,
        loggedIn: PermissionLevel.WRITE,
      },
    },
    revisionRetentionDays: 0,
  };
}

export function registerNoteConfig(
  noteConfig: NoteConfig,
): ConfigFactory<NoteConfig> & ConfigFactoryKeyHost<NoteConfig> {
  return registerAs('noteConfig', (): NoteConfig => noteConfig);
}

export default registerNoteConfig(createDefaultMockNoteConfig());
