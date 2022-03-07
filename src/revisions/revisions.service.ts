/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { NotesService } from '../notes/notes.service';
import { EditService } from './edit.service';
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
    private editService: EditService,
  ) {
    this.logger.setContext(RevisionsService.name);
  }

  async getAllRevisions(note: Note): Promise<Revision[]> {
    return await this.revisionRepository.find({
      where: {
        note: note,
      },
    });
  }

  /**
   * @async
   * Purge revision history of a note.
   * @param {Note} note - the note to purge the history
   * @return {Revision[]} an array of purged revisions
   */
  async purgeRevisions(note: Note): Promise<Revision[]> {
    const revisions = await this.revisionRepository.find({
      where: {
        note: note,
      },
    });
    const latestRevison = await this.getLatestRevision(note);
    // get all revisions except the latest
    const oldRevisions = revisions.filter(
      (item) => item.id !== latestRevison.id,
    );
    // delete the old revisions
    return await this.revisionRepository.remove(oldRevisions);
  }

  async getRevision(note: Note, revisionId: number): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        id: revisionId,
        note: note,
      },
    });
    if (revision === undefined) {
      throw new NotInDBError(
        `Revision with ID ${revisionId} for note ${note.id} not found.`,
      );
    }
    return revision;
  }

  async getLatestRevision(note: Note): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        note: note,
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
    if (revision === undefined) {
      throw new NotInDBError(`Revision for note ${note.id} not found.`);
    }
    return revision;
  }

  async getFirstRevision(note: Note): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        note: note,
      },
      order: {
        createdAt: 'ASC',
      },
    });
    if (revision === undefined) {
      throw new NotInDBError(`Revision for note ${note.id} not found.`);
    }
    return revision;
  }

  toRevisionMetadataDto(revision: Revision): RevisionMetadataDto {
    return {
      id: revision.id,
      length: revision.length,
      createdAt: revision.createdAt,
    };
  }

  async toRevisionDto(revision: Revision): Promise<RevisionDto> {
    return {
      id: revision.id,
      content: revision.content,
      length: revision.length,
      createdAt: revision.createdAt,
      patch: revision.patch,
      edits: await Promise.all(
        (
          await revision.edits
        ).map(async (edit) => await this.editService.toEditDto(edit)),
      ),
    };
  }

  createRevision(content: string): Revision {
    // TODO: Add previous revision
    // TODO: Calculate patch
    // TODO: Save metadata
    return this.revisionRepository.create({
      content: content,
      length: content.length,
      patch: '',
    });
  }
}
