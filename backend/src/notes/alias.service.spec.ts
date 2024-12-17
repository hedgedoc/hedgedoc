/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mock } from 'ts-mockery';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
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
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { RealtimeNoteModule } from '../realtime/realtime-note/realtime-note.module';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { mockSelectQueryBuilderInRepo } from '../utils/test-utils/mockSelectQueryBuilder';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
import { Note } from './note.entity';
import { NotesModule } from './notes.module';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';

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
        NotesService,
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
        NotesModule,
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
      it('an primary alias if no alias is already present', async () => {
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
      it('an non-primary alias if an primary alias is already present', async () => {
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
    describe('does not create an alias', () => {
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
    describe('removes one alias correctly', () => {
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
      it('with one alias, that is primary', async () => {
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
    describe('does not remove one alias', () => {
      let note: Note;
      beforeEach(async () => {
        note = Note.create(user, alias) as Note;
        (await note.aliases).push(Alias.create(alias2, note, false) as Alias);
      });
      it('if the alias is unknown', async () => {
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

    it('mark the alias as primary', async () => {
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
    it('does not mark the alias as primary, if the alias does not exist', async () => {
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
