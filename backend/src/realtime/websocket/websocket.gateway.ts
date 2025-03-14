/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  DisconnectReason,
  MessageTransporter,
  NotePermissions,
  userCanEdit,
} from '@hedgedoc/commons';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { FieldNameUser, User } from 'src/database/types';
import WebSocket from 'ws';

import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { NoteService } from '../../notes/note.service';
import { NotePermission } from '../../permissions/note-permission.enum';
import { PermissionService } from '../../permissions/permission.service';
import { SessionService } from '../../sessions/session.service';
import { UsersService } from '../../users/users.service';
import { RealtimeConnection } from '../realtime-note/realtime-connection';
import { RealtimeNoteService } from '../realtime-note/realtime-note.service';
import { BackendWebsocketAdapter } from './backend-websocket-adapter';
import { extractNoteIdFromRequestUrl } from './utils/extract-note-id-from-request-url';

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
      const noteId = await this.noteService.getNoteIdByAlias(
        extractNoteIdFromRequestUrl(request),
      );

      const notePermission = await this.permissionsService.determinePermission(
        userId,
        noteId,
      );
      if (notePermission < NotePermission.READ) {
        this.logger.log(
          `Access denied to note '${noteId}' for user '${userId}'`,
          'handleConnection',
        );
        clientSocket.close(DisconnectReason.USER_NOT_PERMITTED);
        return;
      }

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

      const permissions = await this.noteService.toNotePermissionsDto(noteId);
      const acceptEdits: boolean = userCanEdit(
        permissions as NotePermissions,
        userId,
      );

      const connection = new RealtimeConnection(
        websocketTransporter,
        userId,
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
      clientSocket.close();
    }
  }

  /**
   * Finds the user id whose session cookie is saved in the given {@link IncomingMessage}.
   *
   * @param request The request that contains the session cookie
   * @return The found user id
   */
  private async findUserIdByRequestSession(
    request: IncomingMessage,
  ): Promise<User[FieldNameUser.id] | null> {
    const sessionId = this.sessionService.extractSessionIdFromRequest(request);
    if (sessionId.isEmpty()) {
      return null;
    }
    const userId = await this.sessionService.getUserIdForSessionId(
      sessionId.get(),
    );
    return userId ?? null;
  }
}
