/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Mock } from 'ts-mockery';

import * as ExtractNoteIdOrAliasModule from '../api/utils/extract-note-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import {
  getNotePermissionDisplayName,
  NotePermission,
} from './note-permission.enum';
import { PermissionsGuard } from './permissions.guard';
import { PermissionsService } from './permissions.service';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';
import { RequiredPermission } from './required-permission.enum';

jest.mock('../api/utils/extract-note-from-request');

describe('permissions guard', () => {
  let loggerService: ConsoleLoggerService;
  let reflector: Reflector;
  let handler: () => void;
  let permissionsService: PermissionsService;
  let requiredPermission: RequiredPermission | undefined;
  let createAllowed = false;
  let requestUser: User | undefined;
  let context: ExecutionContext;
  let permissionGuard: PermissionsGuard;
  let determinedPermission: NotePermission;
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

    permissionsService = Mock.of<PermissionsService>({
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
      .spyOn(ExtractNoteIdOrAliasModule, 'extractNoteFromRequest')
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

  it('will deny if no note alias is present', async () => {
    jest
      .spyOn(ExtractNoteIdOrAliasModule, 'extractNoteFromRequest')
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
    [RequiredPermission.READ, NotePermission.READ, NotePermission.DENY],
    [RequiredPermission.WRITE, NotePermission.WRITE, NotePermission.READ],
    [RequiredPermission.OWNER, NotePermission.OWNER, NotePermission.WRITE],
  ])(
    'with required permission %s',
    (
      shouldRequiredPermission,
      sufficientNotePermission,
      notEnoughNotePermission,
    ) => {
      const sufficientNotePermissionDisplayName = getNotePermissionDisplayName(
        sufficientNotePermission,
      );
      const notEnoughNotePermissionDisplayName = getNotePermissionDisplayName(
        notEnoughNotePermission,
      );

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
