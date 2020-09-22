import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotesService } from '../notes/notes.service';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';
import { Revision } from './revision.entity';

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Revision)
    private revisionRepository: Repository<Revision>,
    @Inject(NotesService) private notesService: NotesService,
  ) {}
  private readonly logger = new Logger(RevisionsService.name);
  async getNoteRevisionMetadatas(
    noteIdOrAlias: string,
  ): Promise<RevisionMetadataDto[]> {
    const note = await this.notesService.getNoteByIdOrAlias(noteIdOrAlias);
    const revisions = await this.revisionRepository.find({
      where: {
        note: note.id,
      },
    });
    return revisions.map(revision => this.toMetadataDto(revision));
  }

  getNoteRevision(noteIdOrAlias: string, revisionId: number): RevisionDto {
    this.logger.warn('Using hardcoded data!');
    return {
      id: revisionId,
      content: 'Foobar',
      patch: 'barfoo',
    };
  }

  getLatestRevision(noteId: string): Promise<Revision> {
    return this.revisionRepository.findOne({
      where: {
        note: noteId,
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
  }

  toMetadataDto(revision: Revision): RevisionMetadataDto {
    return {
      id: revision.id,
      length: revision.length,
      createdAt: revision.createdAt,
    };
  }

  createRevision(content: string) {
    // TODO: Add previous revision
    // TODO: Calculate patch
    return this.revisionRepository.create({
      content: content,
      length: content.length,
      patch: '',
    });
  }
}
