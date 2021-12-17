/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication, Logger, } from '@nestjs/common';
import { decoding } from 'lib0';
import { Server, ServerOptions } from 'ws';

import { MessageType } from './message-type';
import { NoteIdWebsocket } from './note-id-websocket';
import { Observable } from "rxjs";
import { WsAdapter } from "@nestjs/platform-ws";
import { MessageMappingProperties } from "@nestjs/websockets";

export type MessageHandlerCallbackResponse = Promise<Uint8Array | void>;

interface MessageHandler {
  message: string;
  callback: (decoder: decoding.Decoder) => MessageHandlerCallbackResponse;
}

export class YjsWebsocketAdapter extends WsAdapter {
  protected readonly logger = new Logger(YjsWebsocketAdapter.name);

  constructor(private app: INestApplication) {
    super(app);
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

  create(port: number, options: ServerOptions): Server {
    this.logger.log('Initiating WebSocket server for realtime communication');
    return super.create(port, options) as Server;
  }
}
