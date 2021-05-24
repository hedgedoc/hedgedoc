/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplicationContext, Logger } from '@nestjs/common';
import { AbstractWsAdapter } from '@nestjs/websockets';
import { CONNECTION_EVENT, ERROR_EVENT } from '@nestjs/websockets/constants';
import http from 'http';
import https from 'https';
import { decoding } from 'lib0';
import { Observable } from 'rxjs';
import WebSocket, { Server, ServerOptions } from 'ws';
import Y from 'yjs';

import { MessageType } from './message-type';

export type MessageHandlerCallbackResponse = Promise<Uint8Array | void>;

type WebServer = http.Server | https.Server;

interface MessageHandler {
  message: string;
  callback: (data: Uint8Array) => MessageHandlerCallbackResponse;
}

export class YjsAdapter extends AbstractWsAdapter {
  protected readonly logger = new Logger(YjsAdapter.name);

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageHandler[],
    transform: (data: any) => Observable<any>,
  ): any {
    client.binaryType = 'arraybuffer';
    client.on('message', (data: ArrayBuffer) => {
      const uint8Data = new Uint8Array(data);
      const decoder = decoding.createDecoder(uint8Data);
      const messageType = decoding.readVarUint(decoder);
      const handler = handlers.find(
        (handler) => handler.message === MessageType[messageType],
      );
      if (!handler) {
        this.logger.error('Some message handlers were not defined!');
        return;
      }
      handler
        .callback(uint8Data)
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

  create(port: number, options: ServerOptions): Server {
    this.logger.log('Initiating WebSocket server for realtime communication');
    if (this.httpServer) {
      this.logger.log('Using existing WebServer for WebSocket communication');
      const server = new Server({
        server: this.httpServer as WebServer,
        ...options,
      });
      return this.bindErrorHandler(server);
    }
    this.logger.log('Using new WebSocket server instance');
    const server = new Server({
      port,
      ...options,
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
}
