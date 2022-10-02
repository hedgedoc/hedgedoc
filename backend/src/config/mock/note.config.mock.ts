/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { DefaultAccessPermission } from '../default-access-permission.enum';
import { GuestAccess } from '../guest_access.enum';
import { NoteConfig } from '../note.config';

export function createDefaultMockNoteConfig(): NoteConfig {
  return {
    maxDocumentLength: 100000,
    forbiddenNoteIds: ['forbiddenNoteId'],
    permissions: {
      default: {
        everyone: DefaultAccessPermission.READ,
        loggedIn: DefaultAccessPermission.WRITE,
      },
    },
    guestAccess: GuestAccess.CREATE,
  };
}

export function registerNoteConfig(
  noteConfig: NoteConfig,
): ConfigFactory<NoteConfig> & ConfigFactoryKeyHost<NoteConfig> {
  return registerAs('noteConfig', (): NoteConfig => noteConfig);
}

export default registerNoteConfig(createDefaultMockNoteConfig());
