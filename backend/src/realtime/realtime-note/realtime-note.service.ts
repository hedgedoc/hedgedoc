/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Optional } from '@mrdrogdrog/optional';
import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import appConfiguration, { AppConfig } from '../../config/app.config';
import { NoteEvent } from '../../events';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { NotePermission } from '../../permissions/note-permission.enum';
import { PermissionsService } from '../../permissions/permissions.service';
import { RevisionsService } from '../../revisions/revisions.service';
import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';
import { RealtimeNoteStore } from './realtime-note-store';

@Injectable()
export class RealtimeNoteService implements BeforeApplicationShutdown {
  constructor(
    private revisionsService: RevisionsService,
    private readonly logger: ConsoleLoggerService,
    private realtimeNoteStore: RealtimeNoteStore,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
    private permissionService: PermissionsService,
  ) {}

  beforeApplicationShutdown(): void {
    this.realtimeNoteStore
      .getAllRealtimeNotes()
      .forEach((realtimeNote) => realtimeNote.destroy());
  }

  /**
   * Reads the current content from the given {@link RealtimeNote} and creates a new {@link Revision} for the linked {@link Note}.
   *
   * @param realtimeNote The realtime note for which a revision should be created
   */
  public saveRealtimeNote(realtimeNote: RealtimeNote): void {
    this.revisionsService
      .createAndSaveRevision(
        realtimeNote.getNote(),
        realtimeNote.getRealtimeDoc().getCurrentContent(),
        realtimeNote.getRealtimeDoc().encodeStateAsUpdate(),
      )
      .then(() => {
        realtimeNote.announceMetadataUpdate();
      })
      .catch((reason) => this.logger.error(reason));
  }

  /**
   * Creates or reuses a {@link RealtimeNote} that is handling the real time editing of the {@link Note} which is identified by the given note id.
   * @param note The {@link Note} for which a {@link RealtimeNote realtime note} should be retrieved.
   * @throws NotInDBError if note doesn't exist or has no revisions.
   * @return A {@link RealtimeNote} that is linked to the given note.
   */
  public async getOrCreateRealtimeNote(note: Note): Promise<RealtimeNote> {
    return (
      this.realtimeNoteStore.find(note.id) ??
      (await this.createNewRealtimeNote(note))
    );
  }

  /**
   * Creates a new {@link RealtimeNote} for the given {@link Note}.
   *
   * @param note The note for which the realtime note should be created
   * @throws NotInDBError if note doesn't exist or has no revisions.
   * @return The created realtime note
   */
  private async createNewRealtimeNote(note: Note): Promise<RealtimeNote> {
    const lastRevision = await this.revisionsService.getLatestRevision(note);
    const realtimeNote = this.realtimeNoteStore.create(
      note,
      lastRevision.content,
      lastRevision.yjsStateVector ?? undefined,
    );
    realtimeNote.on('beforeDestroy', () => {
      this.saveRealtimeNote(realtimeNote);
    });
    this.startPersistTimer(realtimeNote);
    return realtimeNote;
  }

  /**
   * Starts a timer that persists the realtime note in a periodic interval depending on the {@link AppConfig}.

   * @param realtimeNote The realtime note for which the timer should be started
   */
  private startPersistTimer(realtimeNote: RealtimeNote): void {
    Optional.of(this.appConfig.persistInterval)
      .filter((value) => value > 0)
      .ifPresent((persistInterval) => {
        const intervalId = setInterval(
          this.saveRealtimeNote.bind(this, realtimeNote),
          persistInterval * 60 * 1000,
        );
        this.schedulerRegistry.addInterval(
          `periodic-persist-${realtimeNote.getNote().id}`,
          intervalId,
        );
        realtimeNote.on('destroy', () => {
          clearInterval(intervalId);
          this.schedulerRegistry.deleteInterval(
            `periodic-persist-${realtimeNote.getNote().id}`,
          );
        });
      });
  }

  @OnEvent(NoteEvent.PERMISSION_CHANGE)
  public async handleNotePermissionChanged(note: Note): Promise<void> {
    const realtimeNote = this.realtimeNoteStore.find(note.id);
    if (!realtimeNote) return;

    realtimeNote.announceMetadataUpdate();
    const allConnections = realtimeNote.getConnections();
    await this.updateOrCloseConnection(allConnections, note);
  }

  private async updateOrCloseConnection(
    connections: RealtimeConnection[],
    note: Note,
  ): Promise<void> {
    for (const connection of connections) {
      const permission = await this.permissionService.determinePermission(
        connection.getUser(),
        note,
      );
      if (permission === NotePermission.DENY) {
        connection.getTransporter().disconnect();
      } else {
        connection.acceptEdits = permission > NotePermission.READ;
      }
    }
  }

  @OnEvent(NoteEvent.DELETION)
  public handleNoteDeleted(noteId: Note['id']): void {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote) {
      realtimeNote.announceNoteDeletion();
    }
  }
}
