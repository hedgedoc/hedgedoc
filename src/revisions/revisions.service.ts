import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotesService } from '../notes/notes.service';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';
import { Revision } from './revision.entity';

@Injectable()
export class RevisionsService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Revision)
    private revisionRepository: Repository<Revision>,
    @Inject(forwardRef(() => NotesService)) private notesService: NotesService,
  ) {
    this.logger.setContext(RevisionsService.name);
  }

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

  async getNoteRevision(
    noteIdOrAlias: string,
    revisionId: number,
  ): Promise<RevisionDto> {
    const note = await this.notesService.getNoteByIdOrAlias(noteIdOrAlias);
    const revision = await this.revisionRepository.findOne({
      where: {
        id: revisionId,
        note: note,
      },
    });
    return this.toDto(revision);
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

  toDto(revision: Revision): RevisionDto {
    return {
      id: revision.id,
      content: revision.content,
      createdAt: revision.createdAt,
      patch: revision.patch,
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
