/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel, PermissionLevelNames } from '@hedgedoc/commons';
import mockedEnv from 'mocked-env';

import noteConfig from './note.config';

describe('noteConfig', () => {
  const forbiddenNoteIds = ['forbidden_1', 'forbidden_2'];
  const forbiddenNoteId = 'single_forbidden_id';
  const invalidforbiddenNoteIds = ['', ''];
  const maxDocumentLength = 1234;
  const negativeMaxDocumentLength = -123;
  const floatMaxDocumentLength = 2.71;
  const invalidMaxDocumentLength = 'not-a-max-document-length';
  const guestAccess = PermissionLevel.FULL;
  const wrongDefaultPermission = 'wrong';
  const retentionDays = 30;

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      expect(config.revisionRetentionDays).toEqual(retentionDays);
      restore();
    });

    it('when no HD_FORBIDDEN_NOTE_IDS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenNoteIds).toHaveLength(0);
      expect(config.maxDocumentLength).toEqual(maxDocumentLength);
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when HD_FORBIDDEN_NOTE_IDS is a single item', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteId,
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_MAX_DOCUMENT_LENGTH is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_EVERYONE is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_LOGGED_IN is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSIONS_MAX_GUEST_LEVEL is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.maxGuestLevel).toEqual(PermissionLevel.FULL);
      restore();
    });

    it('when no HD_REVISION_RETENTION_DAYS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
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
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `HD_PERMISSIONS_DEFAULT_EVERYONE: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      restore();
    });

    it('when given a non-valid HD_PERMISSIONS_DEFAULT_LOGGED_IN', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN: wrongDefaultPermission,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `HD_PERMISSIONS_DEFAULT_LOGGED_IN: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      restore();
    });

    it('when given a non-valid HD_PERMISSIONS_MAX_GUEST_LEVEL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSION_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSION_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_MAX_GUEST_LEVEL: wrongDefaultPermission,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `HD_PERMISSIONS_MAX_GUEST_LEVEL: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_MAX_GUEST_LEVEL is set to deny and HD_PERMISSION_DEFAULT_EVERYONE is set', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_MAX_GUEST_LEVEL: 'deny',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[PermissionLevel.READ]}', but 'HD_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[PermissionLevel.DENY]}'. This does not work since the default level may not be higher than the maximum guest level.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to write, but HD_PERMISSION_DEFAULT_LOGGED_IN is set to read', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[PermissionLevel.WRITE]}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${PermissionLevelNames[PermissionLevel.READ]}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to write, but HD_PERMISSION_DEFAULT_LOGGED_IN is set to none', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.DENY],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[PermissionLevel.WRITE]}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${PermissionLevelNames[PermissionLevel.DENY]}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
      );
      restore();
    });

    it('when HD_PERMISSIONS_DEFAULT_EVERYONE is set to read, but HD_PERMISSIONS_DEFAULT_LOGGED_IN is set to none', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.DENY],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      expect(() => noteConfig()).toThrow(
        `'HD_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[PermissionLevel.READ]}', but 'HD_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${PermissionLevelNames[PermissionLevel.DENY]}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
      );
      restore();
    });

    it('when given a negative retention days', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_FORBIDDEN_NOTE_IDS: forbiddenNoteIds.join(' , '),
          HD_MAX_DOCUMENT_LENGTH: maxDocumentLength.toString(),
          HD_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
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
