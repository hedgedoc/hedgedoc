/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  DisconnectReason,
  DisconnectReasonCode,
  MessageTransporter,
  PermissionLevel,
} from '@hedgedoc/commons';
import { FieldNameUser } from '@hedgedoc/database';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { NoteService } from '../../notes/note.service';
import { PermissionService } from '../../permissions/permission.service';
import { SessionService } from '../../sessions/session.service';
import { UsersService } from '../../users/users.service';
import { RealtimeConnection } from '../realtime-note/realtime-connection';
import { RealtimeNoteService } from '../realtime-note/realtime-note.service';
import { BackendWebsocketAdapter } from './backend-websocket-adapter';
import { extractNoteAliasFromRequestUrl } from './utils/extract-note-id-from-request-url';

/**
 * Gateway implementing the realtime logic required for realtime note editing.
 */
@WebSocketGateway({ path: '/realtime' })
export class WebsocketGateway implements OnGatewayConnection {
  constructor(
    private readonly logger: ConsoleLoggerService,
    private noteService: NoteService,
    private realtimeNoteService: RealtimeNoteService,
    private userService: UsersService,
    private permissionsService: PermissionService,
    private sessionService: SessionService,
  ) {
    this.logger.setContext(WebsocketGateway.name);
  }

  /**
   * Handler that is called for each new WebSocket client connection.
   * Checks whether the requested URL path is valid, whether the requested note
   * exists and whether the requesting user has access to the note.
   * Closes the connection to the client if one of the conditions does not apply.
   *
   * @param clientSocket The WebSocket client object.
   * @param request The underlying HTTP request of the WebSocket connection.
   */
  async handleConnection(
    clientSocket: WebSocket,
    request: IncomingMessage,
  ): Promise<void> {
    try {
      const userId = await this.findUserIdByRequestSession(request);
      if (userId === undefined) {
        clientSocket.close(
          DisconnectReasonCode.SESSION_NOT_FOUND,
          DisconnectReason[DisconnectReasonCode.SESSION_NOT_FOUND],
        );
        return;
      }
      const noteId = await this.noteService.getNoteIdByAlias(
        extractNoteAliasFromRequestUrl(request),
      );
      const user = await this.userService.getUserById(userId);
      const username = user[FieldNameUser.username];
      const displayName = user[FieldNameUser.displayName];
      const authorStyle = user[FieldNameUser.authorStyle];

      const notePermission = await this.permissionsService.determinePermission(
        userId,
        noteId,
      );
      if (notePermission < PermissionLevel.READ) {
        this.logger.log(
          `Access denied to note '${noteId}' for user '${userId}'`,
          'handleConnection',
        );
        clientSocket.close(
          DisconnectReasonCode.USER_NOT_PERMITTED,
          DisconnectReason[DisconnectReasonCode.USER_NOT_PERMITTED],
        );
        return;
      }
      const acceptEdits: boolean = notePermission >= PermissionLevel.WRITE;

      this.logger.debug(
        `New realtime connection to note '${noteId}' by user '${userId}' from ${
          request.socket.remoteAddress ?? 'unknown'
        }`,
      );

      const realtimeNote =
        await this.realtimeNoteService.getOrCreateRealtimeNote(noteId);

      const websocketTransporter = new MessageTransporter();
      websocketTransporter.setAdapter(
        new BackendWebsocketAdapter(clientSocket),
      );

      const connection = new RealtimeConnection(
        websocketTransporter,
        userId,
        username,
        displayName,
        authorStyle,
        realtimeNote,
        acceptEdits,
      );

      realtimeNote.addClient(connection);

      websocketTransporter.markAsReady();
    } catch (error: unknown) {
      this.logger.error(
        `Error occurred while initializing: ${(error as Error).message}`,
        (error as Error).stack,
        'handleConnection',
      );
      clientSocket.close(
        DisconnectReasonCode.INTERNAL_ERROR,
        DisconnectReason[DisconnectReasonCode.INTERNAL_ERROR],
      );
    }
  }

  /**
   * Finds the user id whose session cookie is saved in the given {@link IncomingMessage}.
   *
   * @param request The request that contains the session cookie
   * @returns The found user id
   */
  private async findUserIdByRequestSession(
    request: IncomingMessage,
  ): Promise<number | undefined> {
    const sessionId = this.sessionService.extractSessionIdFromRequest(request);
    if (sessionId.isEmpty()) {
      return undefined;
    }
    return await this.sessionService.getUserIdForSessionId(sessionId.get());
  }
}
