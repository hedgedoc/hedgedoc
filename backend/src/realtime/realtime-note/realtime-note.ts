/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  encodeDocumentDeletedMessage,
  encodeMetadataUpdatedMessage,
} from '@hedgedoc/commons';
import { Logger } from '@nestjs/common';
import { EventEmitter2, EventMap } from 'eventemitter2';
import { Awareness } from 'y-protocols/awareness';

import { Note } from '../../notes/note.entity';
import { WebsocketAwareness } from './websocket-awareness';
import { WebsocketConnection } from './websocket-connection';
import { WebsocketDoc } from './websocket-doc';

export interface MapType extends EventMap {
  destroy: () => void;
  beforeDestroy: () => void;
}

/**
 * Represents a note currently being edited by a number of clients.
 */
export class RealtimeNote extends EventEmitter2<MapType> {
  protected logger: Logger;
  private readonly websocketDoc: WebsocketDoc;
  private readonly websocketAwareness: WebsocketAwareness;
  private readonly clients = new Set<WebsocketConnection>();
  private isClosing = false;

  constructor(private readonly note: Note, initialContent: string) {
    super();
    this.logger = new Logger(`${RealtimeNote.name} ${note.id}`);
    this.websocketDoc = new WebsocketDoc(this, initialContent);
    this.websocketAwareness = new WebsocketAwareness(this);
    this.logger.debug(`New realtime session for note ${note.id} created.`);
  }

  /**
   * Connects a new client to the note.
   *
   * For this purpose a {@link WebsocketConnection} is created and added to the client map.
   *
   * @param client the websocket connection to the client
   */
  public addClient(client: WebsocketConnection): void {
    this.clients.add(client);
    this.logger.debug(`User '${client.getUsername()}' connected`);
  }

  /**
   * Disconnects the given websocket client while cleaning-up if it was the last user in the realtime note.
   *
   * @param {WebSocket} client The websocket client that disconnects.
   */
  public removeClient(client: WebsocketConnection): void {
    this.clients.delete(client);
    this.logger.debug(
      `User '${client.getUsername()}' disconnected. ${
        this.clients.size
      } clients left.`,
    );
    if (!this.hasConnections() && !this.isClosing) {
      this.destroy();
    }
  }

  /**
   * Destroys the current realtime note by deleting the y-js doc and disconnecting all clients.
   *
   * @throws Error if note has already been destroyed
   */
  public destroy(): void {
    if (this.isClosing) {
      throw new Error('Note already destroyed');
    }
    this.logger.debug('Destroying realtime note.');
    this.emit('beforeDestroy');
    this.isClosing = true;
    this.websocketDoc.destroy();
    this.websocketAwareness.destroy();
    this.clients.forEach((value) => value.disconnect());
    this.emit('destroy');
  }

  /**
   * Checks if there's still clients connected to this note.
   *
   * @return {@code true} if there a still clinets connected, otherwise {@code false}
   */
  public hasConnections(): boolean {
    return this.clients.size !== 0;
  }

  /**
   * Returns all {@link WebsocketConnection WebsocketConnections} currently hold by this note.
   *
   * @return an array of {@link WebsocketConnection WebsocketConnections}
   */
  public getConnections(): WebsocketConnection[] {
    return [...this.clients];
  }

  /**
   * Get the {@link Doc YDoc} of the note.
   *
   * @return the {@link Doc YDoc} of the note
   */
  public getYDoc(): WebsocketDoc {
    return this.websocketDoc;
  }

  /**
   * Get the {@link Awareness YAwareness} of the note.
   *
   * @return the {@link Awareness YAwareness} of the note
   */
  public getAwareness(): Awareness {
    return this.websocketAwareness;
  }

  /**
   * Get the {@link Note note} that is edited.
   *
   * @return the {@link Note note}
   */
  public getNote(): Note {
    return this.note;
  }

  /**
   * Announce to all clients that the permissions of the note have been changed.
   */
  public announcePermissionChange(): void {
    this.sendToAllClients(encodeMetadataUpdatedMessage());
  }

  /**
   * Announce to all clients that the note has been deleted.
   */
  public announceNoteDeletion(): void {
    this.sendToAllClients(encodeDocumentDeletedMessage());
  }

  /**
   * Broadcasts the given content to all connected clients.
   *
   * @param {Uint8Array} content The binary message to broadcast
   */
  private sendToAllClients(content: Uint8Array): void {
    this.getConnections().forEach((connection) => {
      connection.send(content);
    });
  }
}
