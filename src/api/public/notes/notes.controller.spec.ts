import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorColor } from '../../../notes/author-color.entity';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { Authorship } from '../../../revisions/authorship.entity';
import { Revision } from '../../../revisions/revision.entity';
import { RevisionsModule } from '../../../revisions/revisions.module';
import { AuthToken } from '../../../users/auth-token.entity';
import { Identity } from '../../../users/identity.entity';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { NotesController } from './notes.controller';

describe('Notes Controller', () => {
  let controller: NotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: {},
        },
      ],
      imports: [RevisionsModule, UsersModule],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthorColor))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
