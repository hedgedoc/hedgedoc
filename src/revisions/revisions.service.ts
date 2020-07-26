import { Injectable, Logger } from '@nestjs/common';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';

@Injectable()
export class RevisionsService {
  private readonly logger = new Logger(RevisionsService.name);
  getNoteRevisionMetadatas(noteIdOrAlias: string): RevisionMetadataDto[] {
    this.logger.warn('Using hardcoded data!');
    return [
      {
        id: 'some-uuid',
        updatedAt: new Date(),
        length: 42,
      },
    ];
  }

  getNoteRevision(noteIdOrAlias: string, revisionId: string): RevisionDto {
    this.logger.warn('Using hardcoded data!');
    return {
      id: revisionId,
      content: 'Foobar',
      patch: 'barfoo',
    };
  }
}
