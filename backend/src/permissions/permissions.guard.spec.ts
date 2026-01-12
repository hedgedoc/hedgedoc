/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel, PermissionLevelNames } from '@hedgedoc/commons';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Mock } from 'ts-mockery';

import * as ExtractNoteIdOrAliasModule from '../api/utils/extract-note-id-from-request';
import { CompleteRequest } from '../api/utils/request.type';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { PermissionService } from './permission.service';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSION_METADATA_KEY } from './require-permission.decorator';

jest.mock('../api/utils/extract-note-id-from-request');

// oxlint-disable-next-line func-style
const buildContext = (userId: number | undefined, handler: () => void): ExecutionContext => {
  const request = Mock.of<CompleteRequest>({
    userId: userId,
  });

  return Mock.of<ExecutionContext>({
    getHandler: () => handler,
    switchToHttp: () =>
      Mock.of({
        getRequest: () => request,
      }),
  });
};

describe('PermissionsGuard', () => {
  let loggerService: ConsoleLoggerService;
  let reflector: Reflector;
  let handler: () => void;
  let permissionsService: PermissionService;
  let permissionGuard: PermissionsGuard;
  let spyOnExtractNoteId: jest.SpyInstance;

  const mockUserId = 42;
  const mockNoteId = 23;

  beforeEach(() => {
    loggerService = Mock.of<ConsoleLoggerService>({
      setContext: jest.fn(),
      error: jest.fn(),
    });

    reflector = Mock.of<Reflector>({
      get: jest.fn(),
    });

    handler = jest.fn();

    permissionsService = Mock.of<PermissionService>({
      checkIfUserMayCreateNote: jest.fn(),
      determinePermission: jest.fn(),
    });

    spyOnExtractNoteId = jest.spyOn(ExtractNoteIdOrAliasModule, 'extractNoteIdFromRequest');

    permissionGuard = new PermissionsGuard(
      loggerService,
      reflector,
      permissionsService,
      Mock.of({}),
    );
  });

  it('sets the correct logger context', () => {
    expect(loggerService.setContext).toHaveBeenCalledWith(PermissionsGuard.name);
  });

  it('fails with no required permission', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = buildContext(undefined, handler);
    await expect(permissionGuard.canActivate(context)).rejects.toThrow(Error);
    expect(loggerService.error).toHaveBeenCalledTimes(1);
    expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
  });

  describe('with FULL permission required', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockReturnValue(PermissionLevel.FULL);
      spyOnExtractNoteId.mockResolvedValue(undefined);
    });
    it('will allow if the user is allowed to create a note', async () => {
      const context = buildContext(mockUserId, handler);
      jest.spyOn(permissionsService, 'checkIfUserMayCreateNote').mockResolvedValue(true);
      expect(await permissionGuard.canActivate(context)).toBe(true);
      expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenNthCalledWith(1, mockUserId);
      expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
    });

    it('will deny if the user does not exist', async () => {
      const context = buildContext(undefined, handler);
      expect(await permissionGuard.canActivate(context)).toBe(false);
      expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenCalledTimes(0);
      expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
    });

    it("will deny if user isn't allowed to create a note", async () => {
      const context = buildContext(mockUserId, handler);
      jest.spyOn(permissionsService, 'checkIfUserMayCreateNote').mockResolvedValue(false);
      expect(await permissionGuard.canActivate(context)).toBe(false);
      expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenNthCalledWith(1, mockUserId);
      expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
    });
  });

  it('will deny if no note alias is present and required permission is not FULL', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(PermissionLevel.WRITE);
    spyOnExtractNoteId.mockResolvedValue(undefined);
    jest.spyOn(ExtractNoteIdOrAliasModule, 'extractNoteIdFromRequest').mockResolvedValue(undefined);
    const context = buildContext(mockUserId, handler);
    expect(await permissionGuard.canActivate(context)).toBe(false);
    expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenCalledTimes(0);
    expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
    expect(loggerService.error).toHaveBeenCalledTimes(1);
  });

  describe.each([
    [PermissionLevel.READ, PermissionLevel.READ, PermissionLevel.DENY],
    [PermissionLevel.WRITE, PermissionLevel.WRITE, PermissionLevel.READ],
    [PermissionLevel.FULL, PermissionLevel.FULL, PermissionLevel.WRITE],
  ])(
    'with required permission %s',
    (shouldRequiredPermission, sufficientNotePermission, notEnoughNotePermission) => {
      const sufficientNotePermissionDisplayName = PermissionLevelNames[sufficientNotePermission];
      const notEnoughNotePermissionDisplayName = PermissionLevelNames[notEnoughNotePermission];
      let context: ExecutionContext;

      beforeEach(() => {
        jest.spyOn(reflector, 'get').mockReturnValue(shouldRequiredPermission);
        spyOnExtractNoteId.mockResolvedValue(mockNoteId);
        context = buildContext(mockUserId, handler);
      });

      it(`will allow for note permission ${sufficientNotePermissionDisplayName}`, async () => {
        jest
          .spyOn(permissionsService, 'determinePermission')
          .mockResolvedValue(sufficientNotePermission);
        expect(await permissionGuard.canActivate(context)).toBe(true);
        expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenCalledTimes(0);
        expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
        expect(permissionsService.determinePermission).toHaveBeenNthCalledWith(
          1,
          mockUserId,
          mockNoteId,
        );
      });

      it(`will deny for note permission ${notEnoughNotePermissionDisplayName}`, async () => {
        jest
          .spyOn(permissionsService, 'determinePermission')
          .mockResolvedValue(notEnoughNotePermission);
        expect(await permissionGuard.canActivate(context)).toBe(false);
        expect(permissionsService.checkIfUserMayCreateNote).toHaveBeenCalledTimes(0);
        expect(reflector.get).toHaveBeenNthCalledWith(1, PERMISSION_METADATA_KEY, handler);
        expect(permissionsService.determinePermission).toHaveBeenNthCalledWith(
          1,
          mockUserId,
          mockNoteId,
        );
      });
    },
  );
});
