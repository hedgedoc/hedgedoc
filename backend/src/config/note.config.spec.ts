/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess } from '@hedgedoc/commons';
import mockedEnv from 'mocked-env';

import { DefaultAccessLevel } from './default-access-level.enum';
import noteConfig from './note.config';

describe('noteConfig', () => {
  const forbiddenNoteIds = ['forbidden_1', 'forbidden_2'];
  const forbiddenNoteId = 'single_forbidden_id';
  const invalidforbiddenNoteIds = ['', ''];
  const maxDocumentLength = 1234;
  const negativeMaxDocumentLength = -123;
  const floatMaxDocumentLength = 2.71;
  const invalidMaxDocumentLength = 'not-a-max-document-length';
  const guestAccess = GuestAccess.CREATE;
  const wrongDefaultPermission = 'wrong';
  const retentionDays = 30;

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          HD_REVISION_RETENTION_DAYS: retentionDays.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.guestAccess).toEqual(guestAccess);
      expect(config.revisionRetentionDays).toEqual(retentionDays);
      restore();
    });

    it('when no HD_FORBIDDEN_NOTE_IDS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(0);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.guestAccess).toEqual(guestAccess);
      restore();
    });

    it('when HD_FORBIDDEN_NOTE_IDS is a single item', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteId,
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(1);
      expect(config.forbiddenNoteIds[0]).toEqual(forbiddenNoteId);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );

      expect(config.guestAccess).toEqual(guestAccess);
      restore();
    });

    it('when no HD_MAX_DOCUMENT_LENGTH is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(100000);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );

      expect(config.guestAccess).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_EVERYONE is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );

      expect(config.guestAccess).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_LOGGED_IN is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.WRITE,
      );

      expect(config.guestAccess).toEqual(guestAccess);
      restore();
    });

    it('when no HD_GUEST_ACCESS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.WRITE,
      );

      expect(config.guestAccess).toEqual(GuestAccess.WRITE);
      restore();
    });

    it('when no HD_REVISION_RETENTION_DAYS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(forbiddenNoteIds.length);
      expect(config.forbiddenNoteIds).toEqual(forbiddenNoteIds);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        DefaultAccessLevel.READ,
      );
      expect(config.guestAccess).toEqual(guestAccess);
      expect(config.revisionRetentionDays).toEqual(0);
      restore();
    });
  });

  describe('throws error', () => {
    it('when given a non-valid HD_FORBIDDEN_NOTE_IDS', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: invalidforbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        'HD_FORBIDDEN_NOTE_IDS[0]: String must contain at least 1 character(s)\n - HD_FORBIDDEN_NOTE_IDS[1]: String must contain at least 1 character(s)',
      );
      restore();
    });

    it('when given a negative HD_MAX_DOCUMENT_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: negativeMaxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        'HD_MAX_DOCUMENT_LENGTH: Number must be greater than 0',
      );
      restore();
    });

    it('when given a non-integer HD_MAX_DOCUMENT_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: floatMaxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        'HD_MAX_DOCUMENT_LENGTH: Expected integer, received float',
      );
      restore();
    });

    it('when given a non-number HD_MAX_DOCUMENT_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: invalidMaxDocumentLength,
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        'HD_MAX_DOCUMENT_LENGTH: Expected number, received nan',
      );
      restore();
    });

    it('when given a non-valid HD_PERMISSIONS_DEFAULT_EVERYONE', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: wrongDefaultPermission,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        "HD_PERMISSIONS_DEFAULT_EVERYONE: Invalid enum value. Expected 'none' | 'read' | 'write', received 'wrong'",
      );
      restore();
    });

    it('when given a non-valid HD_PERMISSIONS_DEFAULT_LOGGED_IN', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: wrongDefaultPermission,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        "HD_PERMISSIONS_DEFAULT_LOGGED_IN: Invalid enum value. Expected 'none' | 'read' | 'write', received 'wrong'",
      );
      restore();
    });

    it('when given a non-valid HD_GUEST_ACCESS', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSION_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSION_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: wrongDefaultPermission,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        "HD_GUEST_ACCESS: Invalid enum value. Expected 'deny' | 'read' | 'write' | 'create', received 'wrong'",
      );
      restore();
    });

    it('when HD_GUEST_ACCESS is set to deny and HD_PERMISSION_DEFAULT_EVERYONE is set', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: 'deny',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_GUEST_ACCESS' is set to 'deny', but 'HD_PERMISSIONS_DEFAULT_EVERYONE' is also configured. Please remove 'HD_PERMISSIONS_DEFAULT_EVERYONE'.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to write, but HD_PERMISSION_DEFAULT_LOGGED_IN is set to read', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.WRITE,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${DefaultAccessLevel.WRITE}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${DefaultAccessLevel.READ}'. This gives everyone greater permissions than logged-in users which is not allowed.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to write, but HD_PERMISSION_DEFAULT_LOGGED_IN is set to none', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.WRITE,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.NONE,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${DefaultAccessLevel.WRITE}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${DefaultAccessLevel.NONE}'. This gives everyone greater permissions than logged-in users which is not allowed.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to read, but HD_PERMISSIONS_DEFAULT_LOGGED_IN is set to none', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.NONE,
          HD_GUEST_ACCESS: guestAccess,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${DefaultAccessLevel.READ}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${DefaultAccessLevel.NONE}'. This gives everyone greater permissions than logged-in users which is not allowed.`,
      );
      restore();
    });

    it('when given a negative retention days', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE: DefaultAccessLevel.READ,
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: DefaultAccessLevel.READ,
          HD_GUEST_ACCESS: guestAccess,
          HD_REVISION_RETENTION_DAYS: (-1).toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        'HD_REVISION_RETENTION_DAYS: Number must be greater than or equal to 0',
      );
      restore();
    });
  });
});
