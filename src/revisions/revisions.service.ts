import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';
import { Revision } from './revision.entity';

@Injectable()
export class RevisionsService {
  constructor(
    @InjectRepository(Revision)
    private revisionRepository: Repository<Revision>,
  ) {}
  private readonly logger = new Logger(RevisionsService.name);
  getNoteRevisionMetadatas(noteIdOrAlias: string): RevisionMetadataDto[] {
    this.logger.warn('Using hardcoded data!');
    return [
      {
        id: 42,
        updatedAt: new Date(),
        length: 42,
      },
    ];
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
