/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess } from '@hedgedoc/commons';
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { DefaultAccessLevel } from '../default-access-level.enum';
import { NoteConfig } from '../note.config';

export function createDefaultMockNoteConfig(): NoteConfig {
  return {
    maxDocumentLength: 100000,
    forbiddenNoteIds: ['forbiddenNoteId'],
    permissions: {
      default: {
        everyone: DefaultAccessLevel.READ,
        loggedIn: DefaultAccessLevel.WRITE,
      },
    },
    guestAccess: GuestAccess.CREATE,
    revisionRetentionDays: 0,
  };
}

export function registerNoteConfig(
  noteConfig: NoteConfig,
): ConfigFactory<NoteConfig> & ConfigFactoryKeyHost<NoteConfig> {
  return registerAs('noteConfig', (): NoteConfig => noteConfig);
}

export default registerNoteConfig(createDefaultMockNoteConfig());
