/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import {
  FieldNameGroup,
  FieldNameGroupUser,
  FieldNameMediaUpload,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameUser,
  TableGroup,
  TableGroupUser,
  TableMediaUpload,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableUser,
} from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import { AliasService } from '../alias/alias.service';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import {
  createDefaultMockNoteConfig,
  registerNoteConfig,
} from '../config/mock/note.config.mock';
import { NoteConfig } from '../config/note.config';
import { expectBindings, IS_FIRST } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockSelect,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import {
  GenericDBError,
  NotInDBError,
  PermissionError,
} from '../errors/errors';
import { NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { LoggerModule } from '../logger/logger.module';
import { NoteService } from '../notes/note.service';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RevisionsService } from '../revisions/revisions.service';
import { UsersService } from '../users/users.service';
import { PermissionService } from './permission.service';

describe('PermissionsService', () => {
  let service: PermissionService;
  let userService: UsersService;
  const noteMockConfig: NoteConfig = createDefaultMockNoteConfig();
  let tracker: Tracker;
  let knexProvider: Provider;

  const mockUserId1 = 1;
  const mockUserName1 = 'TestUser1';
  const mockUserId2 = 2;
  const mockUserName2 = 'TestUser2';
  const mockGroupId1 = 23;
  const mockGroupName1 = 'TestGroup1';
  const mockMediaUploadUuid = '15207877-0780-4567-9f39-1082e6391afb';
  const mockNoteId = 42;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        knexProvider,
        UsersService,
        EventEmitter2<NoteEventMap>,
        GroupsService,
        NoteService,
        RevisionsService,
        AliasService,
        RealtimeNoteStore,
      ],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            registerNoteConfig(noteMockConfig),
          ],
        }),
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    userService = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {});

  afterEach(() => {
    tracker.reset();
    jest.resetModules();
    jest.restoreAllMocks();
  });

  describe('checkMediaDeletePermission', () => {
    afterEach(() => {
      expectBindings(tracker, 'select', [[mockMediaUploadUuid]], true);
    });

    // eslint-disable-next-line func-style
    const buildMockSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [
          `${TableMediaUpload}"."${FieldNameMediaUpload.userId}`,
          `${TableNote}"."${FieldNameNote.ownerId}`,
        ],
        TableMediaUpload,
        FieldNameMediaUpload.uuid,
        returnValues,
        [
          {
            joinTable: TableNote,
            keyLeft: FieldNameNote.id,
            keyRight: FieldNameMediaUpload.noteId,
          },
        ],
      );
    };

    it('throws NotInDBError if dbResult is undefined', async () => {
      buildMockSelect([]);
      await expect(
        service.checkMediaDeletePermission(mockUserId1, mockMediaUploadUuid),
      ).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[mockMediaUploadUuid]], true);
    });

    describe('return true', () => {
      it('for media owner', async () => {
        buildMockSelect([
          {
            [FieldNameMediaUpload.userId]: mockUserId1,
            [FieldNameNote.ownerId]: mockUserId2,
          },
        ]);
        expect(
          await service.checkMediaDeletePermission(
            mockUserId1,
            mockMediaUploadUuid,
          ),
        ).toBeTruthy();
      });
      it('for note owner', async () => {
        buildMockSelect([
          {
            [FieldNameMediaUpload.userId]: mockUserId2,
            [FieldNameNote.ownerId]: mockUserId1,
          },
        ]);
        expect(
          await service.checkMediaDeletePermission(
            mockUserId1,
            mockMediaUploadUuid,
          ),
        ).toBeTruthy();
      });
    });

    it('returns false for a non-owner', async () => {
      buildMockSelect([
        {
          [FieldNameMediaUpload.userId]: mockUserId2,
          [FieldNameNote.ownerId]: mockUserId2,
        },
      ]);
      expect(
        await service.checkMediaDeletePermission(
          mockUserId1,
          mockMediaUploadUuid,
        ),
      ).toBeFalsy();
    });
  });

  describe('isOwner', () => {
    // eslint-disable-next-line func-style
    const buildMockSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [FieldNameNote.ownerId],
        TableNote,
        FieldNameNote.id,
        returnValues,
      );
    };
    it('throws NotInDBError if there is note in the db', async () => {
      buildMockSelect([]);
      await expect(service.isOwner(mockUserId1, mockNoteId)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[mockNoteId]], true);
    });
    describe('if a database entry is found', () => {
      it('return true if user is owner', async () => {
        buildMockSelect([
          {
            [FieldNameNote.ownerId]: mockUserId1,
          },
        ]);
        expect(await service.isOwner(mockUserId1, mockNoteId)).toBeTruthy();
        expectBindings(tracker, 'select', [[mockNoteId]], true);
      });
      it("returns false if user isn't the owner", async () => {
        buildMockSelect([
          {
            [FieldNameNote.ownerId]: mockUserId1,
          },
        ]);
        expect(await service.isOwner(mockUserId2, mockNoteId)).toBeFalsy();
        expectBindings(tracker, 'select', [[mockNoteId]], true);
      });
    });
  });

  describe('checkIfUserMayCreateNote', () => {
    let spyUserServiceIsRegisteredUser: jest.SpyInstance;
    beforeEach(() => {
      spyUserServiceIsRegisteredUser = jest.spyOn(
        userService,
        'isRegisteredUser',
      );
    });
    it('allows creation for logged in users', async () => {
      spyUserServiceIsRegisteredUser.mockResolvedValue(true);
      expect(await service.checkIfUserMayCreateNote(mockUserId1)).toBeTruthy();
    });
    it('allows creation of notes for guests with permission', async () => {
      spyUserServiceIsRegisteredUser.mockResolvedValue(false);
      noteMockConfig.permissions.maxGuestLevel = PermissionLevel.FULL;
      expect(await service.checkIfUserMayCreateNote(mockUserId2)).toBeTruthy();
    });
    it('denies creation of notes for guests without permission', async () => {
      spyUserServiceIsRegisteredUser.mockResolvedValue(false);
      noteMockConfig.permissions.maxGuestLevel = PermissionLevel.WRITE;
      expect(await service.checkIfUserMayCreateNote(mockUserId2)).toBeFalsy();
    });
  });

  describe('determinePermission', () => {
    let spyOnPermissionsServiceIsOwner: jest.SpyInstance;
    let spyOnUserServerIsRegisteredUser: jest.SpyInstance;

    beforeEach(() => {
      spyOnPermissionsServiceIsOwner = jest.spyOn(service, 'isOwner');
      spyOnUserServerIsRegisteredUser = jest.spyOn(
        userService,
        'isRegisteredUser',
      );
    });

    it('for the owner', async () => {
      spyOnPermissionsServiceIsOwner.mockResolvedValue(true);
      expect(
        await service.determinePermission(mockUserId1, mockNoteId),
      ).toEqual(PermissionLevel.FULL);
    });

    // eslint-disable-next-line func-style
    const buildUserPermissionsMockSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [FieldNameNoteUserPermission.canEdit],
        TableNoteUserPermission,
        [
          FieldNameNoteUserPermission.noteId,
          FieldNameNoteUserPermission.userId,
        ],
        returnValues,
      );
    };

    // eslint-disable-next-line func-style
    const buildGroupPermissionsMockSelect = (
      groupIds: number[],
      returnValues: unknown,
    ) => {
      const groupIdRows = groupIds.map((value) => ({
        [FieldNameGroupUser.groupId]: value,
      }));
      mockSelect(
        tracker,
        [FieldNameGroupUser.groupId],
        TableGroupUser,
        [FieldNameGroupUser.userId],
        groupIdRows,
      );
      mockSelect(
        tracker,
        [FieldNameNoteGroupPermission.canEdit],
        TableNoteGroupPermission,
        [
          FieldNameNoteGroupPermission.groupId,
          FieldNameNoteGroupPermission.noteId,
        ],
        returnValues,
      );
    };

    // eslint-disable-next-line func-style
    const calculateExpectedPermission = (
      userPermission: PermissionLevel | undefined,
      groupPermission: PermissionLevel | undefined,
    ) => {
      const expectedUserPermissionLevel =
        userPermission ?? PermissionLevel.DENY;
      const expectedGroupPermissionLevel =
        groupPermission ?? PermissionLevel.DENY;
      console.debug(
        `expectedUserPermissionLevel ${expectedUserPermissionLevel}`,
      );
      console.debug(
        `expectedGroupPermissionLevel ${expectedGroupPermissionLevel}`,
      );
      if (expectedUserPermissionLevel >= expectedGroupPermissionLevel) {
        return expectedUserPermissionLevel;
      } else {
        return expectedGroupPermissionLevel;
      }
    };

    describe('for non-owner', () => {
      beforeEach(() => {
        spyOnPermissionsServiceIsOwner.mockResolvedValue(false);
        spyOnUserServerIsRegisteredUser.mockResolvedValue(true);
      });
      describe.each([undefined, PermissionLevel.READ, PermissionLevel.WRITE])(
        'as user with user permission level %s',
        (userPermissionLevel: number | undefined) => {
          beforeEach(() => {
            if (userPermissionLevel === undefined) {
              buildUserPermissionsMockSelect(userPermissionLevel);
            } else {
              buildUserPermissionsMockSelect([
                {
                  [FieldNameNoteUserPermission.canEdit]:
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                    userPermissionLevel >= PermissionLevel.WRITE,
                },
              ]);
            }
          });
          describe.each([
            undefined,
            PermissionLevel.READ,
            PermissionLevel.WRITE,
          ])(
            'with group permission level %s',
            (groupPermissionLevel: number | undefined) => {
              beforeEach(() => {
                if (groupPermissionLevel === undefined) {
                  buildGroupPermissionsMockSelect(
                    [mockGroupId1],
                    groupPermissionLevel,
                  );
                } else {
                  buildGroupPermissionsMockSelect(
                    [mockGroupId1],
                    [
                      {
                        [FieldNameNoteGroupPermission.canEdit]:
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                          groupPermissionLevel >= PermissionLevel.WRITE,
                      },
                    ],
                  );
                }
              });
              const expectedResult = calculateExpectedPermission(
                userPermissionLevel,
                groupPermissionLevel,
              );
              it(`will result into ${PermissionLevel[expectedResult]}`, async () => {
                expect(
                  await service.determinePermission(mockUserId1, mockNoteId),
                ).toEqual(expectedResult);
                const bindings = [[mockNoteId, mockUserId1, IS_FIRST]];
                if (userPermissionLevel !== PermissionLevel.WRITE) {
                  // eslint-disable-next-line jest/no-conditional-expect
                  expect(spyOnUserServerIsRegisteredUser).toHaveBeenCalledWith(
                    mockUserId1,
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect.anything(),
                  );
                  bindings.push([mockUserId1], [mockGroupId1, mockNoteId]);
                }
                expectBindings(tracker, 'select', bindings);
              });
            },
          );
        },
      );
    });

    describe('for non-registered user', () => {
      beforeEach(() => {
        spyOnPermissionsServiceIsOwner.mockResolvedValue(false);
        spyOnUserServerIsRegisteredUser.mockResolvedValue(false);
        noteMockConfig.permissions.maxGuestLevel = PermissionLevel.READ;
      });
      describe.each([undefined, PermissionLevel.READ, PermissionLevel.WRITE])(
        'with group permission level %s',
        (groupPermissionLevel: number | undefined) => {
          beforeEach(() => {
            buildUserPermissionsMockSelect([undefined]);
            if (groupPermissionLevel === undefined) {
              buildGroupPermissionsMockSelect(
                [mockGroupId1],
                groupPermissionLevel,
              );
            } else {
              buildGroupPermissionsMockSelect(
                [mockGroupId1],
                [
                  {
                    [FieldNameNoteGroupPermission.canEdit]:
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                      groupPermissionLevel >= PermissionLevel.WRITE,
                  },
                ],
              );
            }
          });
          it('and maxGuestPermission READ', async () => {
            expect(
              await service.determinePermission(mockUserId1, mockNoteId),
            ).toEqual(groupPermissionLevel ?? PermissionLevel.READ);
          });
        },
      );
    });
  });

  describe('setUserPermission', () => {
    let spyOnIsOwner: jest.SpyInstance;
    beforeEach(() => {
      spyOnIsOwner = jest.spyOn(service, 'isOwner');
    });
    it('directly returns if user is owner', async () => {
      spyOnIsOwner.mockResolvedValue(true);
      await service.setUserPermission(mockNoteId, mockUserId1, true);
      expect(spyOnIsOwner).toHaveBeenCalledTimes(1);
    });
    describe('user is not owner', () => {
      let spyOnIsRegisteredUser: jest.SpyInstance;
      beforeEach(() => {
        spyOnIsOwner.mockResolvedValue(false);
        spyOnIsRegisteredUser = jest.spyOn(userService, 'isRegisteredUser');
      });
      it('and not a registered user', async () => {
        spyOnIsRegisteredUser.mockResolvedValue(false);
        await expect(
          service.setUserPermission(mockNoteId, mockUserId1, true),
        ).rejects.toThrow(PermissionError);
      });
      it('and user is registered', async () => {
        const spyOneNotifyOthers = jest.spyOn(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          service as any,
          'notifyOthers',
        );
        spyOnIsRegisteredUser.mockResolvedValue(true);
        mockInsert(tracker, TableNoteUserPermission, [
          FieldNameNoteUserPermission.canEdit,
          FieldNameNoteUserPermission.noteId,
          FieldNameNoteUserPermission.userId,
        ]);
        await service.setUserPermission(mockNoteId, mockUserId1, true);
        expect(spyOneNotifyOthers).toHaveBeenCalledWith(mockNoteId);
        expectBindings(tracker, 'insert', [[true, mockNoteId, mockUserId1]]);
      });
    });
  });

  describe('removeUserPermission', () => {
    let spyOneNotifyOthers: jest.SpyInstance;
    beforeEach(() => {
      spyOneNotifyOthers = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service as any,
        'notifyOthers',
      );
    });
    function buildMockDelete(deletedEntries: number): void {
      mockDelete(
        tracker,
        TableNoteUserPermission,
        [
          FieldNameNoteUserPermission.noteId,
          FieldNameNoteUserPermission.userId,
        ],
        deletedEntries,
      );
    }
    it('correctly deletes the user permissions and notifies others', async () => {
      buildMockDelete(1);
      await service.removeUserPermission(mockNoteId, mockUserId1);
      expect(spyOneNotifyOthers).toHaveBeenCalledWith(mockNoteId);
      expectBindings(tracker, 'delete', [[mockNoteId, mockUserId1]]);
    });
    it('throws NotInDBError if user does not exist', async () => {
      buildMockDelete(0);
      await expect(
        service.removeUserPermission(mockNoteId, mockUserId1),
      ).rejects.toThrow(NotInDBError);
      expect(spyOneNotifyOthers).toHaveBeenCalledTimes(0);
      expectBindings(tracker, 'delete', [[mockNoteId, mockUserId1]]);
    });
  });

  describe('setGroupPermission', () => {
    it('correctly sets group permissions and notifies other user', async () => {
      const spyOneNotifyOthers = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service as any,
        'notifyOthers',
      );
      mockInsert(tracker, TableNoteGroupPermission, [
        FieldNameNoteGroupPermission.canEdit,
        FieldNameNoteGroupPermission.groupId,
        FieldNameNoteGroupPermission.noteId,
      ]);
      await service.setGroupPermission(mockNoteId, mockGroupId1, true);
      expect(spyOneNotifyOthers).toHaveBeenCalledWith(mockNoteId);
      expectBindings(tracker, 'insert', [[true, mockGroupId1, mockNoteId]]);
    });
  });

  describe('removeGroupPermission', () => {
    let spyOneNotifyOthers: jest.SpyInstance;
    beforeEach(() => {
      spyOneNotifyOthers = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service as any,
        'notifyOthers',
      );
    });
    // eslint-disable-next-line func-style
    const buildMockDelete = (deletedEntries: number) => {
      mockDelete(
        tracker,
        TableNoteGroupPermission,
        [
          FieldNameNoteGroupPermission.noteId,
          FieldNameNoteGroupPermission.groupId,
        ],
        deletedEntries,
      );
    };
    it('correctly deletes the user permissions and notifies others', async () => {
      buildMockDelete(1);
      await service.removeGroupPermission(mockNoteId, mockGroupId1);
      expect(spyOneNotifyOthers).toHaveBeenCalledWith(mockNoteId);
      expectBindings(tracker, 'delete', [[mockNoteId, mockGroupId1]]);
    });
    it('throws NotInDBError if user does not exist', async () => {
      buildMockDelete(0);
      await expect(
        service.removeGroupPermission(mockNoteId, mockGroupId1),
      ).rejects.toThrow(NotInDBError);
      expect(spyOneNotifyOthers).toHaveBeenCalledTimes(0);
      expectBindings(tracker, 'delete', [[mockNoteId, mockGroupId1]]);
    });
  });

  describe('changeOwner', () => {
    let spyOneNotifyOthers: jest.SpyInstance;
    beforeEach(() => {
      spyOneNotifyOthers = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service as any,
        'notifyOthers',
      );
    });
    // eslint-disable-next-line func-style
    const buildMockUpdate = (updatedEntries: number) => {
      mockUpdate(
        tracker,
        TableNote,
        [FieldNameNote.ownerId],
        FieldNameNote.id,
        updatedEntries,
      );
    };
    it('throws NotInDBError when the update does not succed', async () => {
      buildMockUpdate(0);
      await expect(
        service.changeOwner(mockNoteId, mockUserId2),
      ).rejects.toThrow(NotInDBError);
      expect(spyOneNotifyOthers).toHaveBeenCalledTimes(0);
      expectBindings(tracker, 'update', [[mockUserId2, mockNoteId]]);
    });
    it('correctly notifies others', async () => {
      buildMockUpdate(1);
      await service.changeOwner(mockNoteId, mockUserId2);
      expect(spyOneNotifyOthers).toHaveBeenCalledWith(mockNoteId);
      expectBindings(tracker, 'update', [[mockUserId2, mockNoteId]]);
    });
  });

  describe('getPermissionsDtoForNote', () => {
    // eslint-disable-next-line func-style
    const buildMockOwnerSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [`${TableUser}"."${FieldNameUser.username}`],
        TableNote,
        `${TableNote}"."${FieldNameNote.id}`,
        returnValues,
        [
          {
            joinTable: TableUser,
            keyLeft: FieldNameUser.id,
            keyRight: FieldNameNote.ownerId,
          },
        ],
      );
    };
    // eslint-disable-next-line func-style
    const buildMockUserPermissionsSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [
          `${TableUser}"."${FieldNameUser.username}`,
          `${TableNoteUserPermission}"."${FieldNameNoteUserPermission.canEdit}`,
        ],
        TableNoteUserPermission,
        `${TableNoteUserPermission}"."${FieldNameNoteUserPermission.noteId}`,
        returnValues,
        [
          {
            joinTable: TableUser,
            keyLeft: FieldNameUser.id,
            keyRight: FieldNameNoteUserPermission.userId,
          },
        ],
      );
    };
    // eslint-disable-next-line func-style
    const buildMockGroupPermissionsSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [
          `${TableGroup}"."${FieldNameGroup.name}`,
          `${TableNoteGroupPermission}"."${FieldNameNoteGroupPermission.canEdit}`,
        ],
        TableNoteGroupPermission,
        `${TableNoteGroupPermission}"."${FieldNameNoteGroupPermission.noteId}`,
        returnValues,
        [
          {
            joinTable: TableGroup,
            keyLeft: FieldNameGroup.id,
            keyRight: FieldNameNoteGroupPermission.groupId,
          },
        ],
      );
    };
    beforeEach(() => {
      buildMockUserPermissionsSelect([
        {
          [FieldNameUser.username]: mockUserName1,
          [FieldNameNoteUserPermission.canEdit]: true,
        },
      ]);
      buildMockGroupPermissionsSelect([
        {
          [FieldNameGroup.name]: mockGroupName1,
          [FieldNameNoteGroupPermission.canEdit]: true,
        },
      ]);
    });
    it('throws GenericDBError if note has no owner', async () => {
      buildMockOwnerSelect(undefined);
      await expect(
        service.getPermissionsDtoForNote(mockNoteId),
      ).rejects.toThrow(GenericDBError);
      expectBindings(tracker, 'select', [
        [mockNoteId, IS_FIRST],
        [mockNoteId],
        [mockNoteId],
      ]);
    });
    it('correctly returns Dto', async () => {
      buildMockOwnerSelect([
        {
          [FieldNameUser.username]: mockUserName2,
        },
      ]);
      const results = await service.getPermissionsDtoForNote(mockNoteId);
      expect(results.owner).toEqual(mockUserName2);
      expect(results.sharedToUsers).toHaveLength(1);
      expect(results.sharedToUsers[0]).toEqual({
        username: mockUserName1,
        canEdit: true,
      });
      expect(results.sharedToGroups).toHaveLength(1);
      expect(results.sharedToGroups[0]).toEqual({
        groupName: mockGroupName1,
        canEdit: true,
      });
      expectBindings(tracker, 'select', [
        [mockNoteId, IS_FIRST],
        [mockNoteId],
        [mockNoteId],
      ]);
    });
  });
});
