/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  GuestAccess,
  NoteGroupPermissionUpdateDto,
  NoteUserPermissionUpdateDto,
} from '@hedgedoc/commons';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mock } from 'ts-mockery';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
import { DefaultAccessLevel } from '../config/default-access-level.enum';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import {
  createDefaultMockNoteConfig,
  registerNoteConfig,
} from '../config/mock/note.config.mock';
import { NoteConfig } from '../config/note.config';
import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { eventModuleConfig, NoteEvent } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { GroupsService } from '../groups/groups.service';
import { LoggerModule } from '../logger/logger.module';
import { MediaUpload } from '../media/media-upload.entity';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { NoteGroupPermission } from './note-group-permission.entity';
import {
  getNotePermissionDisplayName,
  NotePermission,
} from './note-permission.enum';
import { NoteUserPermission } from './note-user-permission.entity';
import { PermissionsModule } from './permissions.module';
import { PermissionsService } from './permissions.service';
import { convertGuestAccessToNotePermission } from './utils/convert-guest-access-to-note-permission';
import * as FindHighestNotePermissionByGroupModule from './utils/find-highest-note-permission-by-group';
import * as FindHighestNotePermissionByUserModule from './utils/find-highest-note-permission-by-user';

jest.mock(
  './utils/find-highest-note-permission-by-user',
  () =>
    jest.requireActual(
      './utils/find-highest-note-permission-by-user',
    ) as unknown,
);

jest.mock(
  './utils/find-highest-note-permission-by-group',
  () =>
    jest.requireActual(
      './utils/find-highest-note-permission-by-group',
    ) as unknown,
);

function mockedEventEmitter(eventEmitter: EventEmitter2) {
  return jest.spyOn(eventEmitter, 'emit').mockImplementationOnce((event) => {
    expect(event).toEqual(NoteEvent.PERMISSION_CHANGE);
    return true;
  });
}

function mockNoteRepo(noteRepo: Repository<Note>) {
  jest
    .spyOn(noteRepo, 'save')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .mockImplementationOnce(async (entry: Note) => {
      return entry;
    });
}

describe('PermissionsService', () => {
  let service: PermissionsService;
  let groupService: GroupsService;
  let noteRepo: Repository<Note>;
  let userRepo: Repository<User>;
  let groupRepo: Repository<Group>;
  let eventEmitter: EventEmitter2;
  let eventEmitterEmitSpy: jest.SpyInstance;
  const noteMockConfig: NoteConfig = createDefaultMockNoteConfig();

  beforeAll(async () => {
    /**
     * We need to have *one* userRepo and *one* noteRepo for both the providers
     * array and the overrideProvider call, as otherwise we have two instances
     * and the mock of createQueryBuilder replaces the wrong one
     * **/

    userRepo = new Repository<User>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    noteRepo = new Repository<Note>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Note),
          useValue: noteRepo,
        },
        {
          provide: getRepositoryToken(Group),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
      imports: [
        LoggerModule,
        PermissionsModule,
        UsersModule,
        NotesModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            registerNoteConfig(noteMockConfig),
          ],
        }),
        GroupsModule,
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(ApiToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .overrideProvider(getRepositoryToken(Alias))
      .useValue({})
      .compile();
    service = module.get<PermissionsService>(PermissionsService);
    groupService = module.get<GroupsService>(GroupsService);
    groupRepo = module.get<Repository<Group>>(getRepositoryToken(Group));
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  beforeEach(() => {
    mockNoteRepo(noteRepo);
    eventEmitterEmitSpy = mockedEventEmitter(eventEmitter);
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  // The two users we test with:
  const user1 = Mock.of<User>({ id: 1 });
  const user2 = Mock.of<User>({ id: 2 });

  function mockNote(
    owner: User,
    userPermissions: NoteUserPermission[] = [],
    groupPermissions: NoteGroupPermission[] = [],
  ): Note {
    return Mock.of<Note>({
      owner: Promise.resolve(owner),
      userPermissions: Promise.resolve(userPermissions),
      groupPermissions: Promise.resolve(groupPermissions),
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mayCreate', () => {
    it('allows creation for logged in', () => {
      expect(service.mayCreate(user1)).toBeTruthy();
    });
    it('allows creation of notes for guests with permission', () => {
      noteMockConfig.guestAccess = GuestAccess.CREATE;
      noteMockConfig.permissions.default.loggedIn = DefaultAccessLevel.WRITE;
      noteMockConfig.permissions.default.everyone = DefaultAccessLevel.WRITE;
      expect(service.mayCreate(null)).toBeTruthy();
    });
    it('denies creation of notes for guests without permission', () => {
      noteMockConfig.guestAccess = GuestAccess.WRITE;
      noteMockConfig.permissions.default.loggedIn = DefaultAccessLevel.WRITE;
      noteMockConfig.permissions.default.everyone = DefaultAccessLevel.WRITE;
      expect(service.mayCreate(null)).toBeFalsy();
    });
  });

  describe('isOwner', () => {
    it('works correctly if user is owner', async () => {
      const note = mockNote(user1);
      expect(await service.isOwner(user1, note)).toBeTruthy();
    });
    it("works correctly if user isn't the owner", async () => {
      const note = mockNote(user2);
      expect(await service.isOwner(user1, note)).toBeFalsy();
    });
    it('works correctly if no user is provided', async () => {
      const note = mockNote(user2);
      expect(await service.isOwner(null, note)).toBeFalsy();
    });
  });

  describe('checkMediaDeletePermission', () => {
    const noteUserPermission1 = Mock.of<NoteUserPermission>({
      user: Promise.resolve(user1),
      canEdit: false,
    });

    const noteOfUser2 = mockNote(user2, [noteUserPermission1]);

    describe('accepts', () => {
      it('for media owner', async () => {
        const mediaUpload = {} as MediaUpload;
        mediaUpload.note = Promise.resolve(noteOfUser2);
        mediaUpload.user = Promise.resolve(user1);
        expect(
          service.checkMediaDeletePermission(user1, mediaUpload),
        ).toBeTruthy();
      });
      it('for note owner', async () => {
        const mediaUpload = {} as MediaUpload;
        mediaUpload.note = Promise.resolve(noteOfUser2);
        mediaUpload.user = Promise.resolve(user1);
        expect(
          service.checkMediaDeletePermission(user2, mediaUpload),
        ).toBeTruthy();
      });
    });
    describe('denies', () => {
      it('for not owner', async () => {
        const user3 = Mock.of<User>({ id: 3 });
        const mediaUpload = Mock.of<MediaUpload>();
        mediaUpload.note = Promise.resolve(noteOfUser2);
        mediaUpload.user = Promise.resolve(user1);
        expect(
          await service.checkMediaDeletePermission(user3, mediaUpload),
        ).toBeFalsy();
      });
    });
  });

  describe('determinePermission', () => {
    const everyoneGroup = Mock.of<Group>({ id: 99 });
    const loggedInGroup = Mock.of<Group>({ id: 98 });

    beforeEach(() => {
      jest
        .spyOn(groupService, 'getEveryoneGroup')
        .mockImplementation(() => Promise.resolve(everyoneGroup));
      jest
        .spyOn(groupService, 'getLoggedInGroup')
        .mockImplementation(() => Promise.resolve(loggedInGroup));
    });

    describe('with guest user', () => {
      const loggedInReadPermission = Mock.of<NoteGroupPermission>({
        canEdit: false,
        group: Promise.resolve(loggedInGroup),
      });

      it(`with no everyone permission will deny`, async () => {
        const note = mockNote(user1, [], [loggedInReadPermission]);
        const foundPermission = await service.determinePermission(null, note);
        expect(foundPermission).toBe(NotePermission.DENY);
      });

      describe.each([
        GuestAccess.DENY,
        GuestAccess.READ,
        GuestAccess.WRITE,
        GuestAccess.CREATE,
      ])('with configured guest access %s', (guestAccess) => {
        beforeEach(() => {
          noteMockConfig.guestAccess = guestAccess;
        });

        const guestAccessNotePermission =
          convertGuestAccessToNotePermission(guestAccess);

        describe.each([false, true])(
          'with everybody group permission with edit set to %s',
          (canEdit) => {
            const editPermission = canEdit
              ? NotePermission.WRITE
              : NotePermission.READ;
            const expectedLimitedPermission =
              guestAccessNotePermission >= editPermission
                ? editPermission
                : guestAccessNotePermission;

            const permissionDisplayName = getNotePermissionDisplayName(
              expectedLimitedPermission,
            );
            it(`will ${permissionDisplayName}`, async () => {
              const everybodyPermission = Mock.of<NoteGroupPermission>({
                group: Promise.resolve(everyoneGroup),
                canEdit: canEdit,
              });

              const note = mockNote(
                user1,
                [],
                [everybodyPermission, loggedInReadPermission],
              );

              const foundPermission = await service.determinePermission(
                null,
                note,
              );
              expect(foundPermission).toBe(expectedLimitedPermission);
            });
          },
        );
      });
    });

    describe('with logged in user', () => {
      describe('as owner will be OWNER permission', () => {
        it('without other permissions', async () => {
          const note = mockNote(user1);

          const foundPermission = await service.determinePermission(
            user1,
            note,
          );

          expect(foundPermission).toBe(NotePermission.OWNER);
        });
        it('with other lower permissions', async () => {
          const userPermission = Mock.of<NoteUserPermission>({
            user: Promise.resolve(user1),
            canEdit: true,
          });

          const group1 = Mock.of<Group>({
            name: 'mockGroup',
            id: 99,
            members: Promise.resolve([user1]),
          });

          const groupPermission = Mock.of<NoteGroupPermission>({
            group: Promise.resolve(group1),
            canEdit: true,
          });

          const note = mockNote(user1, [userPermission], [groupPermission]);

          const foundPermission = await service.determinePermission(
            user1,
            note,
          );

          expect(foundPermission).toBe(NotePermission.OWNER);
        });
      });
      describe('as non owner', () => {
        it('with user permission higher than group permission', async () => {
          jest
            .spyOn(
              FindHighestNotePermissionByUserModule,
              'findHighestNotePermissionByUser',
            )
            .mockReturnValue(Promise.resolve(NotePermission.DENY));
          jest
            .spyOn(
              FindHighestNotePermissionByGroupModule,
              'findHighestNotePermissionByGroup',
            )
            .mockReturnValue(Promise.resolve(NotePermission.WRITE));

          const note = mockNote(user2);

          const foundPermission = await service.determinePermission(
            user1,
            note,
          );
          expect(foundPermission).toBe(NotePermission.WRITE);
        });

        it('with group permission higher than user permission', async () => {
          jest
            .spyOn(
              FindHighestNotePermissionByUserModule,
              'findHighestNotePermissionByUser',
            )
            .mockReturnValue(Promise.resolve(NotePermission.WRITE));
          jest
            .spyOn(
              FindHighestNotePermissionByGroupModule,
              'findHighestNotePermissionByGroup',
            )
            .mockReturnValue(Promise.resolve(NotePermission.DENY));

          const note = mockNote(user2);

          const foundPermission = await service.determinePermission(
            user1,
            note,
          );
          expect(foundPermission).toBe(NotePermission.WRITE);
        });
      });
    });
  });

  describe('updateNotePermissions', () => {
    const userPermissionUpdate: NoteUserPermissionUpdateDto = {
      username: 'hardcoded',
      canEdit: true,
    };

    const groupPermissionUpdate: NoteGroupPermissionUpdateDto = {
      groupName: 'testGroup',
      canEdit: false,
    };
    const user = User.create(userPermissionUpdate.username, 'Testy') as User;
    const group = Group.create(
      groupPermissionUpdate.groupName,
      groupPermissionUpdate.groupName,
      false,
    ) as Group;
    const note = Note.create(user) as Note;
    it('emits PERMISSION_CHANGE event', async () => {
      expect(eventEmitterEmitSpy).not.toHaveBeenCalled();
      await service.updateNotePermissions(note, {
        sharedToUsers: [],
        sharedToGroups: [],
      });
      expect(eventEmitterEmitSpy).toHaveBeenCalled();
    });
    describe('works', () => {
      it('with empty GroupPermissions and with empty UserPermissions', async () => {
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [],
          sharedToGroups: [],
        });
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect(await savedNote.groupPermissions).toHaveLength(0);
      });
      it('with empty GroupPermissions and with new UserPermissions', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [],
        });
        expect(await savedNote.userPermissions).toHaveLength(1);
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(await savedNote.groupPermissions).toHaveLength(0);
      });
      it('with empty GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.userPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithPreexistingPermissions),
            user: Promise.resolve(user),
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [],
        });
        expect(await savedNote.userPermissions).toHaveLength(1);
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(await savedNote.groupPermissions).toHaveLength(0);
      });
      it('with new GroupPermissions and with empty UserPermissions', async () => {
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [],
          sharedToGroups: [groupPermissionUpdate],
        });
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with new GroupPermissions and with new UserPermissions', async () => {
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(note, {
          sharedToUsers: [userPermissionUpdate],
          sharedToGroups: [groupPermissionUpdate],
        });
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with new GroupPermissions and with existing UserPermissions', async () => {
        const noteWithUserPermission: Note = { ...note };
        noteWithUserPermission.userPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithUserPermission),
            user: Promise.resolve(user),
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithUserPermission,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with empty UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithPreexistingPermissions),
            group: Promise.resolve(group),
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [],
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect(await savedNote.userPermissions).toHaveLength(0);
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with new UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithPreexistingPermissions),
            group: Promise.resolve(group),
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
      it('with existing GroupPermissions and with existing UserPermissions', async () => {
        const noteWithPreexistingPermissions: Note = { ...note };
        noteWithPreexistingPermissions.groupPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithPreexistingPermissions),
            group: Promise.resolve(group),
            canEdit: !groupPermissionUpdate.canEdit,
          },
        ]);
        noteWithPreexistingPermissions.userPermissions = Promise.resolve([
          {
            id: 1,
            note: Promise.resolve(noteWithPreexistingPermissions),
            user: Promise.resolve(user),
            canEdit: !userPermissionUpdate.canEdit,
          },
        ]);

        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
        jest.spyOn(groupRepo, 'findOne').mockResolvedValueOnce(group);
        const savedNote = await service.updateNotePermissions(
          noteWithPreexistingPermissions,
          {
            sharedToUsers: [userPermissionUpdate],
            sharedToGroups: [groupPermissionUpdate],
          },
        );
        expect(
          (await (await savedNote.userPermissions)[0].user).username,
        ).toEqual(userPermissionUpdate.username);
        expect((await savedNote.userPermissions)[0].canEdit).toEqual(
          userPermissionUpdate.canEdit,
        );
        expect(
          (await (await savedNote.groupPermissions)[0].group).name,
        ).toEqual(groupPermissionUpdate.groupName);
        expect((await savedNote.groupPermissions)[0].canEdit).toEqual(
          groupPermissionUpdate.canEdit,
        );
      });
    });
    describe('fails:', () => {
      it('userPermissions has duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [userPermissionUpdate, userPermissionUpdate],
            sharedToGroups: [],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });

      it('groupPermissions has duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [],
            sharedToGroups: [groupPermissionUpdate, groupPermissionUpdate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });

      it('userPermissions and groupPermissions have duplicate entries', async () => {
        await expect(
          service.updateNotePermissions(note, {
            sharedToUsers: [userPermissionUpdate, userPermissionUpdate],
            sharedToGroups: [groupPermissionUpdate, groupPermissionUpdate],
          }),
        ).rejects.toThrow(PermissionsUpdateInconsistentError);
      });
    });
  });

  describe('setUserPermission', () => {
    it('emits PERMISSION_CHANGE event', async () => {
      const note = Note.create(null) as Note;
      const user = User.create('test', 'Testy') as User;

      expect(eventEmitterEmitSpy).not.toHaveBeenCalled();
      await service.setUserPermission(note, user, true);
      expect(eventEmitterEmitSpy).toHaveBeenCalled();
    });
    describe('works', () => {
      it('with user not added if owner', async () => {
        const user = User.create('test', 'Testy') as User;
        const note = Note.create(user) as Note;
        const resultNote = await service.setUserPermission(note, user, true);
        expect(await resultNote.userPermissions).toHaveLength(0);
      });

      it('with user not added before and editable', async () => {
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        const resultNote = await service.setUserPermission(note, user, true);
        const noteUserPermission = NoteUserPermission.create(user, note, true);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user not added before and not editable', async () => {
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        const resultNote = await service.setUserPermission(note, user, false);
        const noteUserPermission = NoteUserPermission.create(user, note, false);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user added before and editable', async () => {
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, false),
        ]);

        const resultNote = await service.setUserPermission(note, user, true);
        const noteUserPermission = NoteUserPermission.create(user, note, true);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
      it('with user added before and not editable', async () => {
        const note = Note.create(null) as Note;
        const user = User.create('test', 'Testy') as User;
        note.userPermissions = Promise.resolve([
          NoteUserPermission.create(user, note, true),
        ]);
        const resultNote = await service.setUserPermission(note, user, false);
        const noteUserPermission = NoteUserPermission.create(user, note, false);
        expect((await resultNote.userPermissions)[0]).toStrictEqual(
          noteUserPermission,
        );
      });
    });
  });

  describe('removeUserPermission', () => {
    it('emits PERMISSION_CHANGE event', async () => {
      const note = Note.create(null) as Note;
      const user = User.create('test', 'Testy') as User;
      note.userPermissions = Promise.resolve([
        NoteUserPermission.create(user, note, true),
      ]);

      expect(eventEmitterEmitSpy).not.toHaveBeenCalled();
      await service.removeUserPermission(note, user);
      expect(eventEmitterEmitSpy).toHaveBeenCalled();
    });
    describe('works', () => {
      const note = Note.create(null) as Note;
      const user1 = Mock.of<User>({ id: 1 });
      const user2 = Mock.of<User>({ id: 2 });

      it('with user added before and editable', async () => {
        const noteUserPermission1 = NoteUserPermission.create(
          user1,
          note,
          true,
        );
        const noteUserPermission2 = NoteUserPermission.create(
          user2,
          note,
          true,
        );
        note.userPermissions = Promise.resolve([
          noteUserPermission1,
          noteUserPermission2,
        ]);
        const resultNote = await service.removeUserPermission(note, user1);
        expect(await resultNote.userPermissions).toStrictEqual([
          noteUserPermission2,
        ]);
      });
      it('with user added before and not editable', async () => {
        const noteUserPermission1 = NoteUserPermission.create(
          user1,
          note,
          false,
        );
        const noteUserPermission2 = NoteUserPermission.create(
          user2,
          note,
          false,
        );
        note.userPermissions = Promise.resolve([
          noteUserPermission1,
          noteUserPermission2,
        ]);
        const resultNote = await service.removeUserPermission(note, user1);
        expect(await resultNote.userPermissions).toStrictEqual([
          noteUserPermission2,
        ]);
      });
    });
  });

  describe('setGroupPermission', () => {
    it('emits PERMISSION_CHANGE event', async () => {
      const note = Note.create(null) as Note;
      const group = Group.create('test', 'Testy', false) as Group;

      expect(eventEmitterEmitSpy).not.toHaveBeenCalled();
      await service.setGroupPermission(note, group, true);
      expect(eventEmitterEmitSpy).toHaveBeenCalled();
    });
    describe('works', () => {
      it('with group not added before and editable', async () => {
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        const resultNote = await service.setGroupPermission(note, group, true);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          true,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group not added before and not editable', async () => {
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        const resultNote = await service.setGroupPermission(note, group, false);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          false,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group added before and editable', async () => {
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, false),
        ]);

        const resultNote = await service.setGroupPermission(note, group, true);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          true,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
      it('with group added before and not editable', async () => {
        const note = Note.create(null) as Note;
        const group = Group.create('test', 'Testy', false) as Group;
        note.groupPermissions = Promise.resolve([
          NoteGroupPermission.create(group, note, true),
        ]);
        const resultNote = await service.setGroupPermission(note, group, false);
        const noteGroupPermission = NoteGroupPermission.create(
          group,
          note,
          false,
        );
        expect((await resultNote.groupPermissions)[0]).toStrictEqual(
          noteGroupPermission,
        );
      });
    });
  });

  describe('removeGroupPermission', () => {
    it('emits PERMISSION_CHANGE event', async () => {
      const note = Note.create(null) as Note;
      const group = Group.create('test', 'Testy', false) as Group;
      note.groupPermissions = Promise.resolve([
        NoteGroupPermission.create(group, note, true),
      ]);

      expect(eventEmitterEmitSpy).not.toHaveBeenCalled();
      await service.removeGroupPermission(note, group);
      expect(eventEmitterEmitSpy).toHaveBeenCalled();
    });
    describe('works', () => {
      const note = Note.create(null) as Note;
      const group1 = Mock.of<Group>({ id: 1 });
      const group2 = Mock.of<Group>({ id: 2 });

      it('with editable group', async () => {
        const noteGroupPermission1 = NoteGroupPermission.create(
          group1,
          note,
          true,
        );
        const noteGroupPermission2 = NoteGroupPermission.create(
          group2,
          note,
          true,
        );
        note.groupPermissions = Promise.resolve([
          noteGroupPermission1,
          noteGroupPermission2,
        ]);

        const resultNote = await service.removeGroupPermission(note, group1);
        expect(await resultNote.groupPermissions).toStrictEqual([
          noteGroupPermission2,
        ]);
      });
      it('with not editable group', async () => {
        const noteGroupPermission1 = NoteGroupPermission.create(
          group1,
          note,
          false,
        );
        const noteGroupPermission2 = NoteGroupPermission.create(
          group2,
          note,
          false,
        );
        note.groupPermissions = Promise.resolve([
          noteGroupPermission1,
          noteGroupPermission2,
        ]);
        const resultNote = await service.removeGroupPermission(note, group1);
        expect(await resultNote.groupPermissions).toStrictEqual([
          noteGroupPermission2,
        ]);
      });
    });
  });

  describe('changeOwner', () => {
    it('works', async () => {
      const note = Note.create(null) as Note;
      const user = User.create('test', 'Testy') as User;

      const resultNote = await service.changeOwner(note, user);
      expect(await resultNote.owner).toStrictEqual(user);
    });
  });
});
