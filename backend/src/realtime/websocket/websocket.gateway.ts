/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  DisconnectReason,
  MessageTransporter,
  userCanEdit,
} from '@hedgedoc/commons';
import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';

import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { NotesService } from '../../notes/notes.service';
import { NotePermission } from '../../permissions/note-permission.enum';
import { PermissionsService } from '../../permissions/permissions.service';
import { SessionService } from '../../sessions/session.service';
import { User } from '../../users/user.entity';
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
    private noteService: NotesService,
    private realtimeNoteService: RealtimeNoteService,
    private userService: UsersService,
    private permissionsService: PermissionsService,
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
      const user = await this.findUserByRequestSession(request);
      const note = await this.noteService.getNoteByIdOrAlias(
        extractNoteIdFromRequestUrl(request),
      );

      const username = user?.username ?? 'guest';

      const notePermission = await this.permissionsService.determinePermission(
        user,
        note,
      );
      if (notePermission < NotePermission.READ) {
        this.logger.log(
          `Access denied to note '${note.id}' for user '${username}'`,
          'handleConnection',
        );
        clientSocket.close(DisconnectReason.USER_NOT_PERMITTED);
        return;
      }

      this.logger.debug(
        `New realtime connection to note '${note.id}' (${
          note.publicId
        }) by user '${username}' from ${
          request.socket.remoteAddress ?? 'unknown'
        }`,
      );

      const realtimeNote =
        await this.realtimeNoteService.getOrCreateRealtimeNote(note);

      const websocketTransporter = new MessageTransporter();
      websocketTransporter.setAdapter(
        new BackendWebsocketAdapter(clientSocket),
      );

      const permissions = await this.noteService.toNotePermissionsDto(note);
      const acceptEdits: boolean = userCanEdit(permissions, user?.username);

      const connection = new RealtimeConnection(
        websocketTransporter,
        user,
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
   * Finds the {@link User} whose session cookie is saved in the given {@link IncomingMessage}.
   *
   * @param request The request that contains the session cookie
   * @return The found user
   */
  private async findUserByRequestSession(
    request: IncomingMessage,
  ): Promise<User | null> {
    const sessionId = this.sessionService.extractSessionIdFromRequest(request);

    this.logger.debug(
      'Checking if sessionId is empty',
      'findUserByRequestSession',
    );
    if (sessionId.isEmpty()) {
      return null;
    }
    this.logger.debug('sessionId is not empty', 'findUserByRequestSession');
    const username = await this.sessionService.fetchUsernameForSessionId(
      sessionId.get(),
    );
    if (username === undefined) {
      return null;
    }
    return await this.userService.getUserByUsername(username);
  }
}
