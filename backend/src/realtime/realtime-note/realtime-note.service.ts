/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import { FieldNameRevision } from '@hedgedoc/database';
import { Optional } from '@mrdrogdrog/optional';
import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import appConfiguration, { AppConfig } from '../../config/app.config';
import { NoteEvent } from '../../events';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { PermissionService } from '../../permissions/permission.service';
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
    private permissionService: PermissionService,
  ) {}

  /**
   * Cleans up all {@link RealtimeNote} instances before the application is shut down
   * This method is called by NestJS when the application is shutting down
   */
  beforeApplicationShutdown(): void {
    this.realtimeNoteStore
      .getAllRealtimeNotes()
      .forEach((realtimeNote) => realtimeNote.destroy());
  }

  /**
   * Reads the current content from the given {@link RealtimeNote} and creates a new revision for the linked note.
   *
   * @param realtimeNote The realtime note for which a revision should be created
   */
  public saveRealtimeNote(realtimeNote: RealtimeNote): void {
    this.revisionsService
      .createRevision(
        realtimeNote.getNoteId(),
        realtimeNote.getRealtimeDoc().getCurrentContent(),
        false,
        undefined,
        new Uint8Array(realtimeNote.getRealtimeDoc().encodeStateAsUpdate()),
      )
      .then(() => {
        realtimeNote.announceMetadataUpdate();
      })
      .catch((reason) => this.logger.error(reason));
  }

  /**
   * Creates or reuses a {@link RealtimeNote} that is handling the real-time-editing of the note which is identified by the given note id
   *
   * @param noteId The id of the note for which a {@link RealtimeNote} should be retrieved
   * @returns A RealtimeNote that is linked to the given note.
   * @throws NotInDBError if note doesn't exist or has no revisions.
   */
  public async getOrCreateRealtimeNote(noteId: number): Promise<RealtimeNote> {
    return (
      this.realtimeNoteStore.find(noteId) ??
      (await this.createNewRealtimeNote(noteId))
    );
  }

  /**
   * Creates a new {@link RealtimeNote} for the given note and registers event listeners
   * to persist the note periodically and before it is destroyed
   *
   * @param noteId The id of the note for which the realtime note should be created
   * @returns The created realtime note
   * @throws NotInDBError if the note doesn't exist or has no revisions
   */
  private async createNewRealtimeNote(noteId: number): Promise<RealtimeNote> {
    const lastRevision = await this.revisionsService.getLatestRevision(noteId);
    const realtimeNote = this.realtimeNoteStore.create(
      noteId,
      lastRevision.content,
      lastRevision[FieldNameRevision.yjsStateVector] ?? undefined,
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
          `periodic-persist-${realtimeNote.getNoteId()}`,
          intervalId,
        );
        realtimeNote.on('destroy', () => {
          clearInterval(intervalId);
          this.schedulerRegistry.deleteInterval(
            `periodic-persist-${realtimeNote.getNoteId()}`,
          );
        });
      });
  }

  /**
   * Reflects the changes of the note's permissions to all connections of the note
   *
   * @param noteId The id of the note for that permissions changed
   */
  @OnEvent(NoteEvent.PERMISSION_CHANGE)
  public async handleNotePermissionChanged(noteId: number): Promise<void> {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote === undefined) {
      return;
    }

    realtimeNote.announceMetadataUpdate();
    const allConnections = realtimeNote.getConnections();
    await this.updateOrCloseConnection(allConnections, noteId);
  }

  /**
   * Updates the connections of the given note based on the current permissions of the user.
   * If the user has no permission to edit the note, the connection is closed.
   * Otherwise, it updates the acceptEdits property of the connection.
   *
   * @param connections The connections to update
   * @param noteId The id of the note for which the connections should be updated
   */
  private async updateOrCloseConnection(
    connections: RealtimeConnection[],
    noteId: number,
  ): Promise<void> {
    for (const connection of connections) {
      const userPermissionLevel =
        await this.permissionService.determinePermission(
          connection.getUserId(),
          noteId,
        );
      if (userPermissionLevel === PermissionLevel.DENY) {
        connection.getTransporter().disconnect();
      } else {
        connection.acceptEdits = userPermissionLevel > PermissionLevel.READ;
      }
    }
  }

  /**
   * Reflects the deletion of a note to all connections of the note
   *
   * @param noteId The id of the just deleted note
   */
  @OnEvent(NoteEvent.DELETION)
  public handleNoteDeleted(noteId: number): void {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote) {
      realtimeNote.announceNoteDeletion();
    }
  }

  /**
   * Closes the realtime note for the given note id and saves its content
   * This is called when the note is updated externally, e.g. by the API
   *
   * @param noteId The id of the note for which the realtime note should be closed
   */
  @OnEvent(NoteEvent.CLOSE_REALTIME)
  public closeRealtimeNote(noteId: number): void {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote) {
      realtimeNote.destroy();
    }
  }
}
