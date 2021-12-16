/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import assert from 'assert';
import { IncomingMessage } from 'http';
import { decoding, encoding } from 'lib0';
import WebSocket from 'ws';
import SyncProtocol from 'y-protocols/sync';
import AwarenessProtocol from 'y-protocols/awareness';
import Y from 'yjs';

import { RequestUser } from '../../api/utils/request-user.decorator';
import { SessionGuard } from '../../identity/session.guard';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { Note } from '../../notes/note.entity';
import { NotesService } from '../../notes/notes.service';
import { PermissionsService } from '../../permissions/permissions.service';
import { User } from '../../users/user.entity';
import { MessageType } from './message-type';
import { NoteClientMap } from './note-client-map';
import { WSReadyState } from './ws-ready-state.enum';
import { MessageHandlerCallbackResponse } from './yjs.adapter';

/**
 * Gateway implementing the realtime logic required for realtime note editing.
 */
@WebSocketGateway()
export class RealtimeEditorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NotesService,
    private permissionsService: PermissionsService,
  ) {
    this.logger.setContext(RealtimeEditorGateway.name);
  }

  /** Mapping instance keeping track of WebSocket clients and their associated note identifier. */
  private noteClientMap = new NoteClientMap();

  /** Mapping instance keeping track of note-ids and their associated y-doc. */
  private noteYDocMap = new Map<string, Y.Doc>();

  /**
   * Handler that is called when a WebSocket client disconnects.
   * Removes the client from the note-client mapping instance, if it is present there.
   * @param client The WebSocket client that disconnects.
   */
  handleDisconnect(client: WebSocket): void {
    const noteIdOfClient = this.noteClientMap.getNoteIdByClient(client);
    if (noteIdOfClient === undefined) {
      this.logger.log('Undefined noteid for client');
      return;
    }
    this.logger.log(`Client disconnected from note '${noteIdOfClient}'`);
    this.noteClientMap.removeClient(client);
    if (this.noteClientMap.countClientsByNoteId(noteIdOfClient) === 0) {
      // TODO Clean-up Y-Doc and store to database
      this.noteYDocMap.delete(noteIdOfClient);
    }
    this.logger.debug(
      `Status: ${this.noteClientMap.countClients()} users online on ${this.noteClientMap.countNotes()} notes`,
    );
  }

  /**
   * Handler that is called for each new WebSocket client connection.
   * Checks whether the requested URL path is valid, whether the requested note
   * exists and whether the requesting user has access to the note.
   * Closes the connection to the client if one of the conditions does not apply.
   *
   * @param client The WebSocket client object.
   * @param req The underlying HTTP request of the WebSocket connection.
   * @param user The user that connected to the WebSocket.
   */
  @UseGuards(SessionGuard)
  async handleConnection(
    client: WebSocket,
    req: IncomingMessage,
    @RequestUser() user: User,
  ): Promise<void> {
    client.on('close', () => this.handleDisconnect(client));
    const url = req.url ?? '';
    const pathMatching = /^\/realtime\/(.+)$/.exec(url);
    if (!pathMatching || pathMatching.length < 2) {
      this.logger.log('Realtime connection denied (invalid URL path): ' + url);
      client.close();
      return;
    }
    const noteIdFromPath = pathMatching[1];
    let note: Note;
    try {
      note = await this.noteService.getNoteByIdOrAlias(noteIdFromPath);
    } catch (e) {
      // TODO Send error message to client to avoid reconnects for same note
      client.close();
      this.logger.error(`Encountered an error: ${String(e)}`);
      return;
    }
    if (!this.permissionsService.mayRead(user, note)) {
      // TODO Send error message to client to avoid reconnects for same note
      client.close();
      this.logger.log(
        `Reading note '${noteIdFromPath}' by user '${user.username}' denied!`,
      );
      return;
    }
    this.noteClientMap.addClient(client, note.id);
    if (!this.noteYDocMap.has(note.id)) {
      const yDoc = new Y.Doc();
      this.noteYDocMap.set(note.id, yDoc);
    }
    this.logger.log(
      `Connection to note '${note.id}' by user '${user.username}'`,
    );
    this.logger.debug(
      `Status: ${this.noteClientMap.countClients()} users online on ${this.noteClientMap.countNotes()} notes`,
    );
  }

  /**
   * @private
   * This checks if the WebSocket connection's readyState is not either connecting or open
   * @param client
   * @return boolean indicating if the connection is not ready
   */
  private checkIfConnectionIsNotReady(client: WebSocket): boolean {
    return (
      client.readyState !== WSReadyState.CONNECTING &&
      client.readyState !== WSReadyState.OPEN
    );
  }

  /**
   * Handler that is called when a SYNC message is received from a WebSocket client.
   * SYNC messages are part of the Y-js protocol, containing changes on the note.
   * @param client The WebSocket client that sent the message.
   * @param decoder The decoder instance for decoding the message payload.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage(MessageType.SYNC)
  handleMessageSync(
    client: WebSocket,
    decoder: decoding.Decoder,
  ): MessageHandlerCallbackResponse {
    this.logger.debug('Received SYNC message');
    const noteId = this.noteClientMap.getNoteIdByClient(client);
    assert(noteId);
    const yDoc = this.noteYDocMap.get(noteId);
    if (!yDoc) {
      // We didn't get a yDoc
      return Promise.reject();
    }
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MessageType.SYNC);
    syncProtocol.readSyncMessage(decoder, encoder, yDoc, null);
    return Promise.resolve(encoding.toUint8Array(encoder));
  }

  /**
   * Handler that is called when a AWARENESS message is received from a WebSocket client.
   * AWARENESS messages are part of the Y-js protocol, containing e.g. the cursor states.
   * @param client The WebSocket client that sent the message.
   * @param decoder The decoder instance for decoding the message payload.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage(MessageType.AWARENESS)
  handleMessageAwareness(
    client: WebSocket,
    decoder: decoding.Decoder,
  ): MessageHandlerCallbackResponse {
    this.logger.debug('Received AWARENESS message');
    const noteId = this.noteClientMap.getNoteIdByClient(client);
    assert(noteId);
    const yDoc = this.noteYDocMap.get(noteId);
    if (!yDoc) {
      // We didn't get a yDoc
      return Promise.reject();
    }
    AwarenessProtocol.applyAwarenessUpdate(
      yDoc.awareness,
      decoding.readVarUint8Array(decoder),
      client,
    );
    return Promise.resolve();
  }

  /**
   * Handler that is called when a HEDGEDOC message is received from a WebSocket client.
   * HEDGEDOC messages are custom messages containing other real-time important information like permission changes.
   * @param client The WebSocket client that sent the message.
   * @param decoder The decoder instance for decoding the message payload.
   * @returns void If no response should be send for this request back to the client.
   * @returns Uint8Array Binary data that should be send as a response to the message back to the client.
   */
  @SubscribeMessage(MessageType.HEDGEDOC)
  handleMessageHedgeDoc(
    client: WebSocket,
    decoder: decoding.Decoder,
  ): MessageHandlerCallbackResponse {
    this.logger.debug('Received HEDGEDOC message');
    return Promise.resolve();
  }
}
