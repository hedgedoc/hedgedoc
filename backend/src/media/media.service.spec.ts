/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { Repository } from 'typeorm';

import appConfigMock from '../../src/config/mock/app.config.mock';
import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import mediaConfigMock from '../config/mock/media.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { ClientError, NotInDBError } from '../errors/errors';
import { eventModuleConfig } from '../events';
import { Group } from '../groups/group.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { BackendType } from './backends/backend-type.enum';
import { FilesystemBackend } from './backends/filesystem-backend';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let noteRepo: Repository<Note>;
  let userRepo: Repository<User>;
  let mediaRepo: Repository<MediaUpload>;

  class CreateQueryBuilderClass {
    leftJoinAndSelect: () => CreateQueryBuilderClass;
    where: () => CreateQueryBuilderClass;
    orWhere: () => CreateQueryBuilderClass;
    setParameter: () => CreateQueryBuilderClass;
    getOne: () => MediaUpload;
    getMany: () => MediaUpload[];
  }

  let createQueryBuilderFunc: CreateQueryBuilderClass;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(MediaUpload),
          useClass: Repository,
        },
        FilesystemBackend,
      ],
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            mediaConfigMock,
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
        }),
        LoggerModule,
        NotesModule,
        UsersModule,
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
    })
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(ApiToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .overrideProvider(getRepositoryToken(Alias))
      .useValue({})
      .compile();

    service = module.get<MediaService>(MediaService);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    mediaRepo = module.get<Repository<MediaUpload>>(
      getRepositoryToken(MediaUpload),
    );

    const user = User.create('test123', 'Test 123') as User;
    const uuid = 'f7d334bb-6bb6-451b-9334-bb6bb6d51b5a';
    const filename = 'test.jpg';
    const note = Note.create(user) as Note;
    const mediaUpload = MediaUpload.create(
      uuid,
      filename,
      note,
      user,
      BackendType.FILESYSTEM,
      null,
    ) as MediaUpload;

    const createQueryBuilder = {
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      orWhere: () => createQueryBuilder,
      setParameter: () => createQueryBuilder,
      getOne: () => mediaUpload,
      getMany: () => [mediaUpload],
    };
    createQueryBuilderFunc = createQueryBuilder;
    jest
      .spyOn(mediaRepo, 'createQueryBuilder')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(() => createQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveFile', () => {
    let user: User;
    let note: Note;
    beforeEach(() => {
      user = User.create('hardcoded', 'Testy') as User;
      const alias = 'alias';
      note = Note.create(user, alias) as Note;
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
      const createQueryBuilder = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        orWhere: () => createQueryBuilder,
        setParameter: () => createQueryBuilder,
        getOne: () => note,
      };
      jest
        .spyOn(noteRepo, 'createQueryBuilder')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => createQueryBuilder);
    });

    it('works', async () => {
      const testImage = await fs.readFile('test/public-api/fixtures/test.png');
      let givenUuid = '';
      jest.spyOn(mediaRepo, 'save').mockImplementation();
      jest
        .spyOn(service.mediaBackend, 'saveFile')
        .mockImplementationOnce(
          async (uuid: string, buffer: Buffer): Promise<string | null> => {
            expect(buffer).toEqual(testImage);
            givenUuid = uuid;
            return null;
          },
        );
      jest.spyOn(mediaRepo, 'save').mockImplementationOnce(async (entry) => {
        expect(entry.uuid).toEqual(givenUuid);
        return entry as MediaUpload;
      });
      const upload = await service.saveFile('test.jpg', testImage, user, note);
      expect(upload.fileName).toEqual('test.jpg');
      expect(upload.uuid).toEqual(givenUuid);
      await expect(upload.note).resolves.toEqual(note);
      await expect(upload.user).resolves.toEqual(user);
    });

    describe('fails:', () => {
      it('MIME type not identifiable', async () => {
        await expect(
          service.saveFile('fail.png', Buffer.alloc(1), user, note),
        ).rejects.toThrow(ClientError);
      });

      it('MIME type not supported', async () => {
        const testText = await fs.readFile('test/public-api/fixtures/test.zip');
        await expect(
          service.saveFile('fail.zip', testText, user, note),
        ).rejects.toThrow(ClientError);
      });
    });
  });

  describe('deleteFile', () => {
    it('works', async () => {
      const mockMediaUploadEntry = {
        uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
        fileName: 'testFileName',
        note: Promise.resolve({
          id: 123,
        } as Note),
        backendType: BackendType.FILESYSTEM,
        backendData: 'testBackendData',
        user: Promise.resolve({
          username: 'hardcoded',
        } as User),
      } as MediaUpload;
      jest
        .spyOn(service.mediaBackend, 'deleteFile')
        .mockImplementationOnce(
          async (uuid: string, backendData: string | null): Promise<void> => {
            expect(uuid).toEqual(mockMediaUploadEntry.uuid);
            expect(backendData).toEqual(mockMediaUploadEntry.backendData);
          },
        );
      jest
        .spyOn(mediaRepo, 'remove')
        .mockImplementationOnce(async (entry, _) => {
          expect(entry).toEqual(mockMediaUploadEntry);
          return entry;
        });
      await service.deleteFile(mockMediaUploadEntry);
    });
  });

  describe('getFileUrl', () => {
    it('works', async () => {
      const mockMediaUploadEntry = {
        uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
        fileName: 'testFileName',
        note: Promise.resolve({
          id: 123,
        } as Note),
        backendType: BackendType.FILESYSTEM,
        backendData: '{"ext": "png"}',
        user: Promise.resolve({
          username: 'hardcoded',
        } as User),
      } as MediaUpload;
      await expect(service.getFileUrl(mockMediaUploadEntry)).resolves.toEqual(
        '/uploads/64f260cc-e0d0-47e7-b260-cce0d097e767.png',
      );
    });
  });

  describe('findUploadByFilename', () => {
    it('works', async () => {
      const testFileName = 'testFilename';
      const username = 'hardcoded';
      const backendData = 'testBackendData';
      const mockMediaUploadEntry = {
        uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
        fileName: testFileName,
        note: Promise.resolve({
          id: 123,
        } as Note),
        backendType: BackendType.FILESYSTEM,
        backendData,
        user: Promise.resolve({
          username,
        } as User),
      } as MediaUpload;
      jest
        .spyOn(mediaRepo, 'findOne')
        .mockResolvedValueOnce(mockMediaUploadEntry);
      const mediaUpload = await service.findUploadByFilename(testFileName);
      expect((await mediaUpload.user)?.username).toEqual(username);
      expect(mediaUpload.backendData).toEqual(backendData);
    });
    it("fails: can't find mediaUpload", async () => {
      const testFileName = 'testFilename';
      jest.spyOn(mediaRepo, 'findOne').mockResolvedValueOnce(null);
      await expect(service.findUploadByFilename(testFileName)).rejects.toThrow(
        NotInDBError,
      );
    });
  });

  describe('listUploadsByUser', () => {
    describe('works', () => {
      const username = 'hardcoded';
      it('with one upload from user', async () => {
        const mockMediaUploadEntry = {
          uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
          fileName: 'testFileName',
          note: Promise.resolve({
            id: 123,
          } as Note),
          backendType: BackendType.FILESYSTEM,
          backendData: null,
          user: Promise.resolve({
            username,
          } as User),
        } as MediaUpload;
        createQueryBuilderFunc.getMany = () => [mockMediaUploadEntry];
        expect(
          await service.listUploadsByUser({ username: 'hardcoded' } as User),
        ).toEqual([mockMediaUploadEntry]);
      });

      it('without uploads from user', async () => {
        createQueryBuilderFunc.getMany = () => [];
        const mediaList = await service.listUploadsByUser({
          username: username,
        } as User);
        expect(mediaList).toEqual([]);
      });
      it('with error (null as return value of find)', async () => {
        createQueryBuilderFunc.getMany = () => [];
        const mediaList = await service.listUploadsByUser({
          username: username,
        } as User);
        expect(mediaList).toEqual([]);
      });
    });
  });

  describe('listUploadsByNote', () => {
    describe('works', () => {
      it('with one upload to note', async () => {
        const mockMediaUploadEntry = {
          uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
          fileName: 'testFileName',
          note: Promise.resolve({
            id: 123,
          } as Note),
          backendType: BackendType.FILESYSTEM,
          backendData: null,
          user: Promise.resolve({
            username: 'mockUser',
          } as User),
        } as MediaUpload;
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return [mockMediaUploadEntry];
          },
        };
        jest
          .spyOn(mediaRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const mediaList = await service.listUploadsByNote({
          id: 123,
        } as Note);
        expect(mediaList).toEqual([mockMediaUploadEntry]);
      });

      it('without uploads to note', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return [];
          },
        };
        jest
          .spyOn(mediaRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const mediaList = await service.listUploadsByNote({
          id: 123,
        } as Note);
        expect(mediaList).toEqual([]);
      });
      it('with error (null as return value of find)', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return null;
          },
        };
        jest
          .spyOn(mediaRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const mediaList = await service.listUploadsByNote({
          id: 123,
        } as Note);
        expect(mediaList).toEqual([]);
      });
    });
  });

  describe('removeNoteFromMediaUpload', () => {
    it('works', async () => {
      const mockNote = {} as Note;
      mockNote.aliases = Promise.resolve([
        Alias.create('test', mockNote, true) as Alias,
      ]);
      const mockMediaUploadEntry = {
        uuid: '64f260cc-e0d0-47e7-b260-cce0d097e767',
        fileName: 'testFileName',
        note: mockNote,
        backendType: BackendType.FILESYSTEM,
        backendData: null,
        user: Promise.resolve({
          username: 'mockUser',
        } as User),
      } as unknown as MediaUpload;
      jest.spyOn(mediaRepo, 'save').mockImplementationOnce(async (entry) => {
        expect(await entry.note).toBeNull();
        return entry as MediaUpload;
      });
      await service.removeNoteFromMediaUpload(mockMediaUploadEntry);
      expect(mediaRepo.save).toHaveBeenCalled();
    });
  });
});
