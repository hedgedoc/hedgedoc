/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createPatch } from 'diff';
import { Repository } from 'typeorm';

import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { Tag } from '../notes/tag.entity';
import { EditService } from './edit.service';
import { RevisionMetadataDto } from './revision-metadata.dto';
import { RevisionDto } from './revision.dto';
import { Revision } from './revision.entity';
import { extractRevisionMetadataFromContent } from './utils/extract-revision-metadata-from-content';

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
        note: { id: note.id },
      },
    });
    const latestRevision = await this.getLatestRevision(note);
    // get all revisions except the latest
    const oldRevisions = revisions.filter(
      (item) => item.id !== latestRevision.id,
    );
    // delete the old revisions
    return await this.revisionRepository.remove(oldRevisions);
  }

  async getRevision(note: Note, revisionId: number): Promise<Revision> {
    const revision = await this.revisionRepository.findOne({
      where: {
        id: revisionId,
        note: { id: note.id },
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
        note: { id: note.id },
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
      title: revision.title,
      description: revision.description,
      tags: (await revision.tags).map((tag) => tag.name),
    };
  }

  async toRevisionDto(revision: Revision): Promise<RevisionDto> {
    const revisionUserInfo = await this.getRevisionUserInfo(revision);
    return {
      id: revision.id,
      content: revision.content,
      length: revision.length,
      createdAt: revision.createdAt,
      title: revision.title,
      tags: (await revision.tags).map((tag) => tag.name),
      description: revision.description,
      authorUsernames: revisionUserInfo.usernames,
      anonymousAuthorCount: revisionUserInfo.anonymousUserCount,
      patch: revision.patch,
      edits: await Promise.all(
        (await revision.edits).map(
          async (edit) => await this.editService.toEditDto(edit),
        ),
      ),
    };
  }

  /**
   * Creates (but does not persist(!)) a new {@link Revision} for the given {@link Note}.
   * Useful if the revision is saved together with the note in one action.
   *
   * @async
   * @param note The note for which the revision should be created
   * @param newContent The new note content
   * @param yjsStateVector The yjs state vector that describes the new content
   * @return {Revision} the created revision
   * @return {undefined} if the revision couldn't be created because e.g. the content hasn't changed
   */
  async createRevision(
    note: Note,
    newContent: string,
    yjsStateVector?: number[],
  ): Promise<Revision | undefined> {
    const latestRevision =
      note.id === undefined ? undefined : await this.getLatestRevision(note);
    const oldContent = latestRevision?.content;
    if (oldContent === newContent) {
      return undefined;
    }
    const patch = createPatch(
      note.publicId,
      latestRevision?.content ?? '',
      newContent,
    );
    const { title, description, tags } =
      extractRevisionMetadataFromContent(newContent);

    const tagEntities = tags.map((tagName) => {
      const entity = new Tag();
      entity.name = tagName;
      return entity;
    });

    return Revision.create(
      newContent,
      patch,
      note,
      yjsStateVector ?? null,
      title,
      description,
      tagEntities,
    ) as Revision;
  }

  /**
   * Creates and saves a new {@link Revision} for the given {@link Note}.
   *
   * @async
   * @param note The note for which the revision should be created
   * @param newContent The new note content
   * @param yjsStateVector The yjs state vector that describes the new content
   */
  async createAndSaveRevision(
    note: Note,
    newContent: string,
    yjsStateVector?: number[],
  ): Promise<void> {
    const revision = await this.createRevision(
      note,
      newContent,
      yjsStateVector,
    );
    if (revision) {
      await this.revisionRepository.save(revision);
    }
  }
}
