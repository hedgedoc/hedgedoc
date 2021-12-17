/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpServer, Logger, WebSocketAdapter } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { CONNECTION_EVENT, ERROR_EVENT } from '@nestjs/websockets/constants';
import http from 'http';
import https from 'https';
import { decoding } from 'lib0';
import WebSocket, { Server, ServerOptions } from 'ws';

import { MessageType } from './message-type';
import { NoteIdWebsocket } from './note-id-websocket';

export type MessageHandlerCallbackResponse = Promise<Uint8Array | void>;

type WebServer = http.Server | https.Server;

interface MessageHandler {
  message: string;
  callback: (decoder: decoding.Decoder) => MessageHandlerCallbackResponse;
}

export class YjsAdapter
  implements WebSocketAdapter<Server, NoteIdWebsocket, ServerOptions>
{
  protected readonly logger = new Logger(YjsAdapter.name);
  private readonly httpServer: HttpServer;

  constructor(private app: NestApplication) {
    this.httpServer = app.getUnderlyingHttpServer();
    if (!this.httpServer) {
      throw new Error("Can't use YjsAdapter without HTTP-Server");
    }
  }

  bindMessageHandlers(
    client: NoteIdWebsocket,
    handlers: MessageHandler[],
  ): void {
    client.binaryType = 'arraybuffer';
    client.on('message', (data: ArrayBuffer) => {
      const uint8Data = new Uint8Array(data);
      const decoder = decoding.createDecoder(uint8Data);
      const messageType = decoding.readVarUint(decoder);
      const handler = handlers.find(
        (handler) => handler.message === MessageType[messageType],
      );
      if (!handler) {
        this.logger.error(
          `Message handler for ${MessageType[messageType]} wasn't defined!`,
        );
        return;
      }
      handler
        .callback(decoder)
        .then((response) => {
          if (!response) {
            return;
          }
          client.send(response, {
            binary: true,
          });
        })
        .catch((error: Error) => {
          this.logger.error(
            'An error occurred while handling message: ' + String(error),
          );
        });
    });
  }

  create(): Server {
    this.logger.log('Initiating WebSocket server for realtime communication');
    const server = new Server({
      server: this.httpServer as unknown as WebServer,
    });
    return this.bindErrorHandler(server);
  }

  bindErrorHandler(server: Server): Server {
    server.on(CONNECTION_EVENT, (ws) =>
      ws.on(ERROR_EVENT, (err: Error) => this.logger.error(err)),
    );
    server.on(ERROR_EVENT, (err: Error) => this.logger.error(err));
    return server;
  }

  bindClientConnect(
    server: WebSocket.Server,
    callback: (
      this: Server,
      socket: NoteIdWebsocket,
      request: http.IncomingMessage,
    ) => void,
  ): void {
    server.on('connection', callback);
  }

  bindClientDisconnect(
    client: NoteIdWebsocket,
    callback: (socket: NoteIdWebsocket) => void,
  ): void {
    client.on('close', callback);
  }

  close(server: WebSocket.Server): void {
    server.close();
    this.logger.warn('WebSocket server closed.');
  }
}
