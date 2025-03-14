/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock } from 'ts-mockery';

import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
  PrimaryAliasDeletionForbiddenError,
} from '../errors/errors';
import { eventModuleConfig } from '../events';
import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { NoteService } from '../notes/note.service';
import { RealtimeNoteModule } from '../realtime/realtime-note/realtime-note.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { AliasModule } from './alias.module';
import { AliasService } from './alias.service';

describe('AliasService', () => {
  let service: AliasService;
  let noteRepo: Repository<Note>;
  let aliasRepo: Repository<Alias>;
  let forbiddenNoteId: string;
  beforeEach(async () => {
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
    aliasRepo = new Repository<Alias>(
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
        AliasService,
        NoteService,
        {
          provide: getRepositoryToken(Note),
          useValue: noteRepo,
        },
        {
          provide: getRepositoryToken(Alias),
          useValue: aliasRepo,
        },
        {
          provide: getRepositoryToken(Tag),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
        }),
        LoggerModule,
        UsersModule,
        GroupsModule,
        RevisionsModule,
        AliasModule,
        RealtimeNoteModule,
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Alias))
      .useValue(aliasRepo)
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(ApiToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useClass(Repository)
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
      .compile();

    const config = module.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('noteConfig').forbiddenNoteIds[0];
    service = module.get<AliasService>(AliasService);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    aliasRepo = module.get<Repository<Alias>>(getRepositoryToken(Alias));
  });
  describe('addAlias', () => {
    const alias = 'testAlias';
    const alias2 = 'testAlias2';
    const user = User.create('hardcoded', 'Testy') as User;
    describe('creates', () => {
      it('an primary aliases if no aliases is already present', async () => {
        const note = Note.create(user) as Note;
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (note: Note): Promise<Note> => note);
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
        const savedAlias = await service.addAlias(note, alias);
        expect(savedAlias.name).toEqual(alias);
        expect(savedAlias.primary).toBeTruthy();
      });
      it('an non-primary aliases if an primary aliases is already present', async () => {
        const note = Note.create(user, alias) as Note;
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (note: Note): Promise<Note> => note);
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
        const savedAlias = await service.addAlias(note, alias2);
        expect(savedAlias.name).toEqual(alias2);
        expect(savedAlias.primary).toBeFalsy();
      });
    });
    describe('does not create an aliases', () => {
      const note = Note.create(user, alias2) as Note;
      it('with an already used name', async () => {
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(true);
        await expect(service.addAlias(note, alias2)).rejects.toThrow(
          AlreadyInDBError,
        );
      });
      it('with a forbidden name', async () => {
        await expect(service.addAlias(note, forbiddenNoteId)).rejects.toThrow(
          ForbiddenIdError,
        );
      });
    });
  });

  describe('removeAlias', () => {
    const alias = 'testAlias';
    const alias2 = 'testAlias2';
    const user = User.create('hardcoded', 'Testy') as User;
    describe('removes one aliases correctly', () => {
      let note: Note;
      beforeAll(async () => {
        note = Note.create(user, alias) as Note;
        (await note.aliases).push(Alias.create(alias2, note, false) as Alias);
      });
      it('with two aliases', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (note: Note): Promise<Note> => note);
        jest
          .spyOn(aliasRepo, 'remove')
          .mockImplementationOnce(
            async (alias: Alias): Promise<Alias> => alias,
          );
        const savedNote = await service.removeAlias(note, alias2);
        const aliases = await savedNote.aliases;
        expect(aliases).toHaveLength(1);
        expect(aliases[0].name).toEqual(alias);
        expect(aliases[0].primary).toBeTruthy();
      });
      it('with one aliases, that is primary', async () => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementationOnce(async (note: Note): Promise<Note> => note);
        jest
          .spyOn(aliasRepo, 'remove')
          .mockImplementationOnce(
            async (alias: Alias): Promise<Alias> => alias,
          );
        const savedNote = await service.removeAlias(note, alias);
        expect(await savedNote.aliases).toHaveLength(0);
      });
    });
    describe('does not remove one aliases', () => {
      let note: Note;
      beforeEach(async () => {
        note = Note.create(user, alias) as Note;
        (await note.aliases).push(Alias.create(alias2, note, false) as Alias);
      });
      it('if the aliases is unknown', async () => {
        await expect(service.removeAlias(note, 'non existent')).rejects.toThrow(
          NotInDBError,
        );
      });
      it('if it is primary and not the last one', async () => {
        await expect(service.removeAlias(note, alias)).rejects.toThrow(
          PrimaryAliasDeletionForbiddenError,
        );
      });
    });
  });

  describe('makeAliasPrimary', () => {
    const user = User.create('hardcoded', 'Testy') as User;
    const aliasName = 'testAlias';
    let note: Note;
    let alias: Alias;
    let alias2: Alias;
    beforeEach(async () => {
      note = Note.create(user, aliasName) as Note;
      alias = Alias.create(aliasName, note, true) as Alias;
      alias2 = Alias.create('testAlias2', note, false) as Alias;
      (await note.aliases).push(
        Alias.create('testAlias2', note, false) as Alias,
      );
    });

    it('mark the aliases as primary', async () => {
      jest
        .spyOn(aliasRepo, 'findOneByOrFail')
        .mockResolvedValueOnce(alias)
        .mockResolvedValueOnce(alias2);
      jest
        .spyOn(aliasRepo, 'save')
        .mockImplementationOnce(async (alias: Alias): Promise<Alias> => alias)
        .mockImplementationOnce(async (alias: Alias): Promise<Alias> => alias);

      mockSelectQueryBuilderInRepo(
        noteRepo,
        Mock.of<Note>({
          ...note,
          aliases: Promise.resolve(
            (await note.aliases).map((anAlias) => {
              if (anAlias.primary) {
                anAlias.primary = false;
              }
              if (anAlias.name === alias2.name) {
                anAlias.primary = true;
              }
              return anAlias;
            }),
          ),
        }),
      );

      const savedAlias = await service.makeAliasPrimary(note, alias2.name);
      expect(savedAlias.name).toEqual(alias2.name);
      expect(savedAlias.primary).toBeTruthy();
    });
    it('does not mark the aliases as primary, if the aliases does not exist', async () => {
      await expect(
        service.makeAliasPrimary(note, 'i_dont_exist'),
      ).rejects.toThrow(NotInDBError);
    });
  });

  it('toAliasDto correctly creates an AliasDto', () => {
    const aliasName = 'testAlias';
    const user = User.create('hardcoded', 'Testy') as User;
    const note = Note.create(user, aliasName) as Note;
    const alias = Alias.create(aliasName, note, true) as Alias;
    const aliasDto = service.toAliasDto(alias, note);
    expect(aliasDto.name).toEqual(aliasName);
    expect(aliasDto.primaryAlias).toBeTruthy();
    expect(aliasDto.noteId).toEqual(note.publicId);
  });
});
