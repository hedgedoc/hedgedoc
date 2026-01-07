/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel, PermissionLevelNames } from '@hedgedoc/commons';
import mockedEnv from 'mocked-env';

import noteConfig from './note.config';

describe('noteConfig', () => {
  const forbiddenAliases = ['forbidden_1', 'forbidden_2'];
  const forbiddenAlias = 'single_forbidden_alias';
  const invalidforbiddenAliases = ['', ''];
  const maxLength = 1234;
  const negativeMaxDocumentLength = -123;
  const floatMaxDocumentLength = 2.71;
  const invalidMaxDocumentLength = 'not-a-max-document-length';
  const guestAccess = PermissionLevel.FULL;
  const wrongDefaultPermission = 'wrong';
  const retentionDays = 30;
  const persistInteval = 15;

  describe('correctly parses config', () => {
    it('when given correct and complete environment variables', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_REVISION_RETENTION_DAYS: retentionDays.toString(),
          HD_NOTE_PERSIST_INTERVAL: persistInteval.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      expect(config.revisionRetentionDays).toEqual(retentionDays);
      expect(config.persistInterval).toEqual(persistInteval);
      restore();
    });

    it('when no HD_NOTE_FORBIDDEN_ALIASES is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(0);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when HD_NOTE_FORBIDDEN_ALIASES is a single item', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAlias,
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(1);
      expect(config.forbiddenAliases[0]).toEqual(forbiddenAlias);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_NOTE_MAX_LENGTH is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(100000);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );

      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_EVERYONE is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(PermissionLevel.READ);
      expect(config.permissions.default.loggedIn).toEqual(PermissionLevel.READ);

      expect(config.permissions.maxGuestLevel).toEqual(PermissionLevel.READ);
      restore();
    });

    it('when no HD_PERMISSION_DEFAULT_LOGGED_IN is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
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
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.maxGuestLevel).toEqual(PermissionLevel.FULL);
      restore();
    });

    it('when no HD_NOTE_REVISION_RETENTION_DAYS is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.maxGuestLevel).toEqual(guestAccess);
      expect(config.revisionRetentionDays).toEqual(0);
      restore();
    });

    it('when no HD_NOTE_PERSIST_INTERVAL is set', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.WRITE],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.WRITE],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = noteConfig();
      expect(config.forbiddenAliases).toHaveLength(forbiddenAliases.length);
      expect(config.forbiddenAliases).toEqual(forbiddenAliases);
      expect(config.maxLength).toEqual(maxLength);
      expect(config.permissions.default.everyone).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.permissions.default.loggedIn).toEqual(
        PermissionLevel.WRITE,
      );
      expect(config.persistInterval).toEqual(10);
      restore();
    });
  });

  describe('throws error', () => {
    let spyConsoleError: jest.SpyInstance;
    let spyProcessExit: jest.Mock;
    let originalProcess: typeof process;

    beforeEach(() => {
      spyConsoleError = jest.spyOn(console, 'error');
      spyProcessExit = jest.fn();
      originalProcess = global.process;
      global.process = {
        ...originalProcess,
        exit: spyProcessExit,
      } as unknown as typeof global.process;
    });

    afterEach(() => {
      global.process = originalProcess;
      jest.restoreAllMocks();
    });

    it('when given a non-valid HD_NOTE_FORBIDDEN_ALIASES', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: invalidforbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_FORBIDDEN_ALIASES[0]: String must contain at least 1 character(s)',
      );
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_FORBIDDEN_ALIASES[1]: String must contain at least 1 character(s)',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a negative HD_NOTE_MAX_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: negativeMaxDocumentLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_MAX_LENGTH: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-integer HD_NOTE_MAX_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: floatMaxDocumentLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_MAX_LENGTH: Expected integer, received float',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-number HD_NOTE_MAX_LENGTH', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: invalidMaxDocumentLength,
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_MAX_LENGTH: Expected number, received nan',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-valid HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE: wrongDefaultPermission,
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        `HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-valid HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN: wrongDefaultPermission,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        `HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a non-valid HD_PERMISSIONS_MAX_GUEST_LEVEL', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL: wrongDefaultPermission,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        `HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL: Invalid enum value. Expected '${PermissionLevelNames[PermissionLevel.DENY]}' | '${PermissionLevelNames[PermissionLevel.READ]}' | '${PermissionLevelNames[PermissionLevel.WRITE]}' | '${PermissionLevelNames[PermissionLevel.FULL]}', received 'wrong'`,
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when HD_PERMISSIONS_MAX_GUEST_LEVEL is set to deny and HD_PERMISSION_DEFAULT_EVERYONE is set', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL: 'deny',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        `HD_NOTE: 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${PermissionLevelNames[PermissionLevel.READ]}', but 'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[PermissionLevel.DENY]}'. This does not work since the default level may not be higher than the maximum guest level.`,
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    describe('more complex permissions', () => {
      describe.each([
        [
          PermissionLevelNames[PermissionLevel.WRITE],
          PermissionLevelNames[PermissionLevel.READ],
        ],
        [
          PermissionLevelNames[PermissionLevel.WRITE],
          PermissionLevelNames[PermissionLevel.DENY],
        ],
        [
          PermissionLevelNames[PermissionLevel.READ],
          PermissionLevelNames[PermissionLevel.DENY],
        ],
      ])(
        'check default everyone and logged-in interaction',
        (everyonePermission, loggedInPermission) => {
          it(`when HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE is set to ${everyonePermission}, but HD_PERMISSION_DEFAULT_LOGGED_IN is set to ${loggedInPermission}`, async () => {
            const restore = mockedEnv(
              {
                /* eslint-disable @typescript-eslint/naming-convention */
                HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
                HD_NOTE_MAX_LENGTH: maxLength.toString(),
                HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE: everyonePermission,
                HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN: loggedInPermission,
                /* eslint-enable @typescript-eslint/naming-convention */
              },
              {
                clear: true,
              },
            );
            noteConfig();
            expect(spyConsoleError.mock.calls[0][0]).toContain(
              `HD_NOTE: 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${everyonePermission}', but 'HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN' is set to '${loggedInPermission}'. This would give everyone greater permissions than logged-in users, and is not allowed since it doesn't make sense.`,
            );
            restore();
          });
        },
      );
      describe.each([
        [
          PermissionLevelNames[PermissionLevel.READ],
          PermissionLevelNames[PermissionLevel.DENY],
        ],
      ])(
        'check default everyone and max guest level full',
        (defaultEveryone) => {
          it(`when HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL is set to ${PermissionLevelNames[PermissionLevel.FULL]} and HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE is set to ${defaultEveryone}`, async () => {
            const restore = mockedEnv(
              {
                /* eslint-disable @typescript-eslint/naming-convention */
                HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
                HD_NOTE_MAX_LENGTH: maxLength.toString(),
                HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE: defaultEveryone,
                HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL:
                  PermissionLevelNames[PermissionLevel.FULL],
                /* eslint-enable @typescript-eslint/naming-convention */
              },
              {
                clear: true,
              },
            );
            noteConfig();
            expect(spyConsoleError.mock.calls[0][0]).toContain(
              `'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${PermissionLevelNames[PermissionLevel.FULL]}', but 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${defaultEveryone}'. This does not allow the guest users to write in the notes they can create.`,
            );
            expect(spyProcessExit).toHaveBeenCalledWith(1);
            restore();
          });
        },
      );
      describe.each([
        [
          PermissionLevelNames[PermissionLevel.WRITE],
          PermissionLevelNames[PermissionLevel.READ],
        ],
        [
          PermissionLevelNames[PermissionLevel.WRITE],
          PermissionLevelNames[PermissionLevel.DENY],
        ],
        [
          PermissionLevelNames[PermissionLevel.READ],
          PermissionLevelNames[PermissionLevel.DENY],
        ],
      ])(
        'check default everyone and max guest level full',
        (defaultEveryone, maxGuestLevel) => {
          it(`when 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${defaultEveryone}', but 'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${maxGuestLevel}'`, async () => {
            const restore = mockedEnv(
              {
                /* eslint-disable @typescript-eslint/naming-convention */
                HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
                HD_NOTE_MAX_LENGTH: maxLength.toString(),
                HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE: defaultEveryone,
                HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL: maxGuestLevel,
                /* eslint-enable @typescript-eslint/naming-convention */
              },
              {
                clear: true,
              },
            );
            noteConfig();
            expect(spyConsoleError.mock.calls[0][0]).toContain(
              `HD_NOTE: 'HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE' is set to '${defaultEveryone}', but 'HD_NOTE_PERMISSIONS_MAX_GUEST_LEVEL' is set to '${maxGuestLevel}'. This does not work since the default level may not be higher than the maximum guest level.`,
            );
            expect(spyProcessExit).toHaveBeenCalledWith(1);
            restore();
          });
        },
      );
    });

    it('when given a negative retention days', async () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_REVISION_RETENTION_DAYS: (-1).toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_REVISION_RETENTION_DAYS: Number must be greater than or equal to 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when given a negative persistence interval', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_NOTE_FORBIDDEN_ALIASES: forbiddenAliases.join(' , '),
          HD_NOTE_MAX_LENGTH: maxLength.toString(),
          HD_NOTE_PERMISSIONS_DEFAULT_EVERYONE:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_PERMISSIONS_DEFAULT_LOGGED_IN:
            PermissionLevelNames[PermissionLevel.READ],
          HD_NOTE_REVISION_RETENTION_DAYS: retentionDays.toString(),
          HD_NOTE_PERSIST_INTERVAL: (-1).toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      noteConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_NOTE_PERSIST_INTERVAL: Number must be greater than or equal to 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
