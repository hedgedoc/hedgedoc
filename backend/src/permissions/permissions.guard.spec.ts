/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Mock } from 'ts-mockery';

import * as ExtractNoteIdOrAliasModule from '../api/utils/extract-note-id-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { User } from '../database/user.entity';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import {
  getNotePermissionLevelDisplayName,
  NotePermissionLevel,
} from './note-permission.enum';
import { PermissionService } from './permission.service';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';
import { RequiredPermission } from './required-permission.enum';

jest.mock('../api/utils/extract-note-id-from-request');

describe('permissions guard', () => {
  let loggerService: ConsoleLoggerService;
  let reflector: Reflector;
  let handler: () => void;
  let permissionsService: PermissionService;
  let requiredPermission: RequiredPermission | undefined;
  let createAllowed = false;
  let requestUser: User | undefined;
  let context: ExecutionContext;
  let permissionGuard: PermissionsGuard;
  let determinedPermission: NotePermissionLevel;
  let mockedNote: Note;

  beforeEach(() => {
    loggerService = Mock.of<ConsoleLoggerService>({
      setContext: jest.fn(),
      error: jest.fn(),
    });

    reflector = Mock.of<Reflector>({
      get: jest.fn(() => requiredPermission),
    });

    handler = jest.fn();

    permissionsService = Mock.of<PermissionService>({
      mayCreate: jest.fn(() => createAllowed),
      determinePermission: jest.fn(() => Promise.resolve(determinedPermission)),
    });

    requestUser = Mock.of<User>({});

    const request = Mock.of<CompleteRequest>({
      user: requestUser,
    });

    context = Mock.of<ExecutionContext>({
      getHandler: () => handler,
      switchToHttp: () =>
        Mock.of({
          getRequest: () => request,
        }),
    });
    mockedNote = Mock.of<Note>({});
    jest
      .spyOn(ExtractNoteIdOrAliasModule, 'extractNoteIdFromRequest')
      .mockReturnValue(Promise.resolve(mockedNote));

    permissionGuard = new PermissionsGuard(
      loggerService,
      reflector,
      permissionsService,
      Mock.of({}),
    );

    createAllowed = false;
  });

  it('sets the correct logger context', () => {
    expect(loggerService.setContext).toHaveBeenCalledWith(
      PermissionsGuard.name,
    );
  });

  it('deny fail with no required permission', async () => {
    requiredPermission = undefined;
    requestUser = undefined;

    expect(await permissionGuard.canActivate(context)).toBe(false);
    expect(loggerService.error).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenNthCalledWith(
      1,
      PERMISSION_METADATA_KEY,
      handler,
    );
  });

  describe('with create permission required', () => {
    it('will allow if user is allowed to create a note', async () => {
      createAllowed = true;
      requiredPermission = RequiredPermission.CREATE;

      expect(await permissionGuard.canActivate(context)).toBe(true);
      expect(permissionsService.mayCreate).toHaveBeenNthCalledWith(
        1,
        requestUser,
      );
      expect(reflector.get).toHaveBeenNthCalledWith(
        1,
        PERMISSION_METADATA_KEY,
        handler,
      );
    });

    it("will deny if user isn't allowed to create a note", async () => {
      requiredPermission = RequiredPermission.CREATE;

      expect(await permissionGuard.canActivate(context)).toBe(false);
      expect(permissionsService.mayCreate).toHaveBeenNthCalledWith(
        1,
        requestUser,
      );
      expect(reflector.get).toHaveBeenNthCalledWith(
        1,
        PERMISSION_METADATA_KEY,
        handler,
      );
    });
  });

  it('will deny if no note aliases is present', async () => {
    jest
      .spyOn(ExtractNoteIdOrAliasModule, 'extractNoteIdFromRequest')
      .mockReturnValue(Promise.resolve(undefined));

    requiredPermission = RequiredPermission.READ;

    expect(await permissionGuard.canActivate(context)).toBe(false);
    expect(permissionsService.mayCreate).toHaveBeenCalledTimes(0);
    expect(reflector.get).toHaveBeenNthCalledWith(
      1,
      PERMISSION_METADATA_KEY,
      handler,
    );
    expect(loggerService.error).toHaveBeenCalledTimes(1);
  });

  describe.each([
    [
      RequiredPermission.READ,
      NotePermissionLevel.READ,
      NotePermissionLevel.DENY,
    ],
    [
      RequiredPermission.WRITE,
      NotePermissionLevel.WRITE,
      NotePermissionLevel.READ,
    ],
    [
      RequiredPermission.OWNER,
      NotePermissionLevel.OWNER,
      NotePermissionLevel.WRITE,
    ],
  ])(
    'with required permission %s',
    (
      shouldRequiredPermission,
      sufficientNotePermission,
      notEnoughNotePermission,
    ) => {
      const sufficientNotePermissionDisplayName =
        getNotePermissionLevelDisplayName(sufficientNotePermission);
      const notEnoughNotePermissionDisplayName =
        getNotePermissionLevelDisplayName(notEnoughNotePermission);

      beforeEach(() => {
        requiredPermission = shouldRequiredPermission;
      });

      it(`will allow for note permission ${sufficientNotePermissionDisplayName}`, async () => {
        determinedPermission = sufficientNotePermission;
        expect(await permissionGuard.canActivate(context)).toBe(true);
        expect(permissionsService.mayCreate).toHaveBeenCalledTimes(0);
        expect(reflector.get).toHaveBeenNthCalledWith(
          1,
          PERMISSION_METADATA_KEY,
          handler,
        );
        expect(permissionsService.determinePermission).toHaveBeenNthCalledWith(
          1,
          requestUser,
          mockedNote,
        );
      });

      it(`will deny for note permission ${notEnoughNotePermissionDisplayName}`, async () => {
        determinedPermission = notEnoughNotePermission;
        expect(await permissionGuard.canActivate(context)).toBe(false);
        expect(permissionsService.mayCreate).toHaveBeenCalledTimes(0);
        expect(reflector.get).toHaveBeenNthCalledWith(
          1,
          PERMISSION_METADATA_KEY,
          handler,
        );
        expect(permissionsService.determinePermission).toHaveBeenNthCalledWith(
          1,
          requestUser,
          mockedNote,
        );
      });
    },
  );
});
