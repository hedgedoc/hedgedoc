import { Injectable } from '@nestjs/common';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';

@Injectable()
export class RevisionsService {
  getNoteRevisionMetadatas(noteIdOrAlias: string): RevisionMetadataDto[] {
    return [
      {
        id: 'some-uuid',
        updatedAt: new Date(),
        length: 42,
      },
    ];
  }

  getNoteRevision(noteIdOrAlias: string, revisionId: string): RevisionDto {
    return {
      id: revisionId,
      content: 'Foobar',
      patch: 'barfoo',
    };
  }
}
