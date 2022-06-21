/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { EditService } from './edit.service';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';
import { Revision } from './revision.entity';

class RevisionUserInfo {
  usernames: string[];
  anonymousUserCount: number;
}

@Injectable()
export class RevisionsService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Revision)
    private revisionRepository: Repository<Revision>,
    private editService: EditService,
  ) {
    this.logger.setContext(RevisionsService.name);
  }

  async getAllRevisions(note: Note): Promise<Revision[]> {
    this.logger.debug(`Getting all revisions for note ${note.id}`);
    return await this.revisionRepository
      .createQueryBuilder('revision')
      .where('revision.note = :note', { note: note.id })
      .getMany();
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
        note: Equal(note),
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
        note: Equal(note),
      },
    });
    if (revision === null) {
      throw new NotInDBError(
        `Revision with ID ${revisionId} for note ${note.id} not found.`,
      );
    }
    return revision;
  }

  async getLatestRevision(note: Note): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        note: Equal(note),
      },
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
    if (revision === null) {
      throw new NotInDBError(`Revision for note ${note.id} not found.`);
    }
    return revision;
  }

  async getFirstRevision(note: Note): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        note: Equal(note),
      },
      order: {
        createdAt: 'ASC',
      },
    });
    if (revision === null) {
      throw new NotInDBError(`Revision for note ${note.id} not found.`);
    }
    return revision;
  }

  async getRevisionUserInfo(revision: Revision): Promise<RevisionUserInfo> {
    // get a deduplicated list of all authors
    let authors = await Promise.all(
      (await revision.edits).map(async (edit) => await edit.author),
    );
    authors = [...new Set(authors)]; // remove duplicates with Set

    // retrieve user objects of the authors
    const users = await Promise.all(
      authors.map(async (author) => await author.user),
    );
    // collect usernames of the users
    const usernames = users.flatMap((user) => (user ? [user.username] : []));
    return {
      usernames: usernames,
      anonymousUserCount: users.length - usernames.length,
    };
  }

  async toRevisionMetadataDto(
    revision: Revision,
  ): Promise<RevisionMetadataDto> {
    const revisionUserInfo = await this.getRevisionUserInfo(revision);
    return {
      id: revision.id,
      length: revision.length,
      createdAt: revision.createdAt,
      authorUsernames: revisionUserInfo.usernames,
      anonymousAuthorCount: revisionUserInfo.anonymousUserCount,
    };
  }

  async toRevisionDto(revision: Revision): Promise<RevisionDto> {
    const revisionUserInfo = await this.getRevisionUserInfo(revision);
    return {
      id: revision.id,
      content: revision.content,
      length: revision.length,
      createdAt: revision.createdAt,
      authorUsernames: revisionUserInfo.usernames,
      anonymousAuthorCount: revisionUserInfo.anonymousUserCount,
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
