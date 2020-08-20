import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Note } from '../../../notes/note.entity';
import { NotesService } from '../../../notes/notes.service';
import { Authorship } from '../../../revisions/authorship.entity';
import { Revision } from '../../../revisions/revision.entity';
import { RevisionsModule } from '../../../revisions/revisions.module';
import { NotesController } from './notes.controller';

describe('Notes Controller', () => {
  let controller: NotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [NotesService],
      imports: [RevisionsModule],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Authorship))
      .useValue({})
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
