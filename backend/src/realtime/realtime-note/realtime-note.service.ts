/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SpecialGroup } from '@hedgedoc/commons';
import { Optional } from '@mrdrogdrog/optional';
import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Group } from 'src/groups/group.entity';
import { NoteGroupPermission } from 'src/permissions/note-group-permission.entity';
import { NoteUserPermission } from 'src/permissions/note-user-permission.entity';

import appConfiguration, { AppConfig } from '../../config/app.config';
import { NoteEvent } from '../../events';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { notePermissionEventPayload } from '../../permissions/permissions.service';
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
      .createRevision(
        realtimeNote.getNote(),
        realtimeNote.getRealtimeDoc().getCurrentContent(),
        realtimeNote.getRealtimeDoc().encodeStateAsUpdate(),
      )
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
  public async handleNotePermissionChanged(
    noteId: Note['id'],
    permission: notePermissionEventPayload,
  ) {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote) {
      realtimeNote.announcePermissionChange();
    }

    const allConnections = realtimeNote?.getConnections();
    if (!allConnections) return;

    //update all user's connections acceptEdit permission
    if (permission.userPermission) {
      await this.updateUserConnectionAccpetEdit(
        permission.userPermission,
        allConnections,
      );
    }
    const groupPermissions = await this.getUserGroupPermission(permission);

    //remove all anonymous users, if __everyone groupPermission is not set
    if (!groupPermissions[SpecialGroup.EVERYONE]) {
      const allAnonymousUsers = this.getAllAnonymousUsers(allConnections);
      allAnonymousUsers?.forEach(this.removeConnection);
    } else {
      //update canEdit
      for (const connection of allConnections) {
        connection.acceptEdits =
          groupPermissions[SpecialGroup.EVERYONE].canEdit;
      }
    }
  }

  private async getUserGroupPermission(permission: notePermissionEventPayload) {
    //if permission usernames can edit setAll usernames connection canEdit
    const groupPermissions: Record<SpecialGroup, NoteGroupPermission | null> = {
      [SpecialGroup.EVERYONE]: null,
      [SpecialGroup.LOGGED_IN]: null,
    };

    for (const groupPermission of permission.groupPermission) {
      const group = await groupPermission.group;
      if (group.name === SpecialGroup.EVERYONE) {
        groupPermissions[SpecialGroup.EVERYONE] = groupPermission;
      } else {
        groupPermissions[SpecialGroup.LOGGED_IN] = groupPermission;
      }
    }
    return groupPermissions;
  }

  private async updateUserConnectionAccpetEdit(
    userPermission: NoteUserPermission[],
    connections: RealtimeConnection[],
  ) {
    const allUserConnection = this.getAllUser(connections);
    if (!allUserConnection?.length) return;

    for (const userConnection of allUserConnection) {
      const user = userConnection.getUser();
      if (user?.username)
        userConnection.acceptEdits = await this.getUserAcceptEdit(
          userPermission,
          user?.username,
        );
    }
  }
  private async getUserAcceptEdit(
    permission: NoteUserPermission[],
    username: string,
  ) {
    let userCanEdit = false;
    for (const userPermission of permission) {
      const user = await userPermission.user;
      if (user.username === username) {
        userCanEdit = userPermission.canEdit;
      }
    }
    return userCanEdit;
  }

  private getAllUser(connections: RealtimeConnection[]) {
    return connections.filter((connection) => Boolean(connection.getUser()));
  }
  private getAllAnonymousUsers(connections: RealtimeConnection[]) {
    return connections.filter((connection) => !Boolean(connection.getUser()));
  }

  private removeConnection(connection: RealtimeConnection) {
    connection.getTransporter().disconnect();
  }

  @OnEvent(NoteEvent.DELETION)
  public handleNoteDeleted(noteId: Note['id']): void {
    const realtimeNote = this.realtimeNoteStore.find(noteId);
    if (realtimeNote) {
      realtimeNote.announceNoteDeletion();
    }
  }
}
