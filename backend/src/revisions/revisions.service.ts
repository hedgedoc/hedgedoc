/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RevisionDto, RevisionMetadataDto } from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { createPatch } from 'diff';
import { Repository } from 'typeorm';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Note } from '../notes/note.entity';
import { Tag } from '../notes/tag.entity';
import { EditService } from './edit.service';
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
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @Inject(noteConfiguration.KEY) private noteConfig: NoteConfig,
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

    // update content diff
    if (oldRevisions.length > 0) {
      latestRevision.patch = createPatch(
        note.publicId,
        '',
        latestRevision.content,
      );
      await this.revisionRepository.save(latestRevision);
    }

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
      createdAt: revision.createdAt.toISOString(),
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
      createdAt: revision.createdAt.toISOString(),
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

  // Delete all old revisions everyday on 0:00 AM
  @Cron('0 0 * * *')
  async handleRevisionCleanup(): Promise<void> {
    return await this.removeOldRevisions();
  }

  // Delete all old revisions 5 sec after startup
  @Timeout(5000)
  async handleRevisionCleanupTimeout(): Promise<void> {
    return await this.removeOldRevisions();
  }

  /**
   * Delete old {@link Revision}s except the latest one.
   *
   * @async
   */
  async removeOldRevisions(): Promise<void> {
    const currentTime = new Date().getTime();
    const revisionRetentionDays: number = this.noteConfig.revisionRetentionDays;
    if (revisionRetentionDays <= 0) {
      return;
    }
    const revisionRetentionSeconds =
      revisionRetentionDays * 24 * 60 * 60 * 1000;

    const notes: Note[] = await this.noteRepository.find();
    for (const note of notes) {
      const revisions: Revision[] = await this.revisionRepository.find({
        where: {
          note: { id: note.id },
        },
        order: {
          createdAt: 'ASC',
        },
      });

      const oldRevisions = revisions
        .slice(0, -1) // always keep the latest revision
        .filter(
          (revision) =>
            new Date(revision.createdAt).getTime() <=
            currentTime - revisionRetentionSeconds,
        );
      const remainedRevisions = revisions.filter(
        (val) => !oldRevisions.includes(val),
      );

      if (!oldRevisions.length) {
        continue;
      } else if (oldRevisions.length === revisions.length - 1) {
        const beUpdatedRevision = revisions.slice(-1)[0];
        beUpdatedRevision.patch = createPatch(
          note.publicId,
          '', // there is no older revision
          beUpdatedRevision.content,
        );
        await this.revisionRepository.save(beUpdatedRevision);
      } else {
        const beUpdatedRevision = remainedRevisions.slice(0)[0];
        beUpdatedRevision.patch = createPatch(
          note.publicId,
          oldRevisions.slice(-1)[0].content,
          beUpdatedRevision.content,
        );
        await this.revisionRepository.save(beUpdatedRevision);
      }

      await this.revisionRepository.remove(oldRevisions);
      this.logger.log(
        `${oldRevisions.length} old revisions of the note '${note.id}' were removed from the DB`,
        'removeOldRevisions',
      );
    }
  }
}
