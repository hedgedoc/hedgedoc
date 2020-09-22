import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistoryModule } from '../../../history/history.module';
import { AuthorColor } from '../../../notes/author-color.entity';
import { Note } from '../../../notes/note.entity';
import { NotesModule } from '../../../notes/notes.module';
import { Authorship } from '../../../revisions/authorship.entity';
import { Revision } from '../../../revisions/revision.entity';
import { AuthToken } from '../../../users/auth-token.entity';
import { Identity } from '../../../users/identity.entity';
import { User } from '../../../users/user.entity';
import { UsersModule } from '../../../users/users.module';
import { MeController } from './me.controller';

describe('Me Controller', () => {
  let controller: MeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      imports: [UsersModule, HistoryModule, NotesModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthorColor))
      .useValue({})
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .compile();

    controller = module.get<MeController>(MeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
