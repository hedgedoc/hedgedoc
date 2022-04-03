/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { promises as fs } from 'fs';
import { Repository } from 'typeorm';

import appConfigMock from '../../src/config/mock/app.config.mock';
import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import mediaConfigMock from '../config/mock/media.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { ClientError, NotInDBError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { FilesystemBackend } from './backends/filesystem-backend';
import { BackendData, MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let noteRepo: Repository<Note>;
  let userRepo: Repository<User>;
  let mediaRepo: Repository<MediaUpload>;

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
          load: [mediaConfigMock, appConfigMock, noteConfigMock],
        }),
        LoggerModule,
        NotesModule,
        UsersModule,
      ],
    })
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
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
      let fileId = '';
      jest
        .spyOn(mediaRepo, 'save')
        .mockImplementationOnce(async (entry: MediaUpload) => {
          fileId = entry.id;
          return entry;
        });
      jest
        .spyOn(service.mediaBackend, 'saveFile')
        .mockImplementationOnce(
          async (
            buffer: Buffer,
            fileName: string,
          ): Promise<[string, BackendData]> => {
            expect(buffer).toEqual(testImage);
            return [fileName, null];
          },
        );
      const upload = await service.saveFile(testImage, user, note);
      expect(upload.fileUrl).toEqual(fileId);
    });

    describe('fails:', () => {
      it('MIME type not identifiable', async () => {
        await expect(
          service.saveFile(Buffer.alloc(1), user, note),
        ).rejects.toThrow(ClientError);
      });

      it('MIME type not supported', async () => {
        const testText = await fs.readFile('test/public-api/fixtures/test.zip');
        await expect(service.saveFile(testText, user, note)).rejects.toThrow(
          ClientError,
        );
      });
    });
  });

  describe('deleteFile', () => {
    it('works', async () => {
      const mockMediaUploadEntry = {
        id: 'testMediaUpload',
        backendData: 'testBackendData',
        user: Promise.resolve({
          username: 'hardcoded',
        } as User),
      } as MediaUpload;
      jest
        .spyOn(service.mediaBackend, 'deleteFile')
        .mockImplementationOnce(
          async (fileName: string, backendData: BackendData): Promise<void> => {
            expect(fileName).toEqual(mockMediaUploadEntry.id);
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
  describe('findUploadByFilename', () => {
    it('works', async () => {
      const testFileName = 'testFilename';
      const username = 'hardcoded';
      const backendData = 'testBackendData';
      const mockMediaUploadEntry = {
        id: 'testMediaUpload',
        backendData: backendData,
        user: Promise.resolve({
          username: username,
        } as User),
      } as MediaUpload;
      jest
        .spyOn(mediaRepo, 'findOne')
        .mockResolvedValueOnce(mockMediaUploadEntry);
      const mediaUpload = await service.findUploadByFilename(testFileName);
      expect((await mediaUpload.user).username).toEqual(username);
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
          id: 'testMediaUpload',
          backendData: 'testBackendData',
          user: Promise.resolve({
            username: username,
          } as User),
        } as MediaUpload;
        jest
          .spyOn(mediaRepo, 'find')
          .mockResolvedValueOnce([mockMediaUploadEntry]);
        expect(
          await service.listUploadsByUser({ username: 'hardcoded' } as User),
        ).toEqual([mockMediaUploadEntry]);
      });

      it('without uploads from user', async () => {
        jest.spyOn(mediaRepo, 'find').mockResolvedValueOnce([]);
        const mediaList = await service.listUploadsByUser({
          username: username,
        } as User);
        expect(mediaList).toEqual([]);
      });
      it('with error (null as return value of find)', async () => {
        jest.spyOn(mediaRepo, 'find').mockResolvedValueOnce(null);
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
          id: 'testMediaUpload',
          backendData: 'testBackendData',
          note: Promise.resolve({
            id: '123',
          } as Note),
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
          id: '123',
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
          id: '123',
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
          id: '123',
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
        id: 'testMediaUpload',
        backendData: 'testBackendData',
        note: Promise.resolve(mockNote),
        user: Promise.resolve({
          username: 'hardcoded',
        } as User),
      } as MediaUpload;
      jest
        .spyOn(mediaRepo, 'save')
        .mockImplementationOnce(async (entry: MediaUpload) => {
          expect(await entry.note).toBeNull();
          return entry;
        });
      await service.removeNoteFromMediaUpload(mockMediaUploadEntry);
      expect(mediaRepo.save).toHaveBeenCalled();
    });
  });
});
