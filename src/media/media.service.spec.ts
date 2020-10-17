import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { AuthorColor } from '../notes/author-color.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Authorship } from '../revisions/authorship.entity';
import { Revision } from '../revisions/revision.entity';
import { AuthToken } from '../users/auth-token.entity';
import { Identity } from '../users/identity.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { MediaUpload } from './media-upload.entity';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: getRepositoryToken(MediaUpload),
          useValue: {},
        },
      ],
      imports: [LoggerModule, NotesModule, UsersModule],
    })
      .overrideProvider(getRepositoryToken(AuthorColor))
      .useValue({})
      .overrideProvider(getRepositoryToken(MediaUpload))
      .useValue({})
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
