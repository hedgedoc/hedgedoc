/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { encoding } from 'lib0';
import WebSocket from 'ws';
import { Awareness, encodeAwarenessUpdate } from 'y-protocols/awareness';
import { writeUpdate } from 'y-protocols/sync';
import { Doc } from 'yjs';

import { MessageType } from './message-type';

interface ClientIdUpdate {
  added: number[];
  updated: number[];
  removed: number[];
}

export class MultiClientAwarenessYDoc extends Doc {
  private clients = new Set<WebSocket>();
  public awareness = new Awareness(this);

  constructor() {
    super();
    this.awareness.setLocalState(null);
    this.awareness.on('update', this.handleAwarenessUpdate.bind(this));
    this.on('update', this.handleSyncUpdate.bind(this));
  }

  private handleAwarenessUpdate(
    { added, updated, removed }: ClientIdUpdate,
    origin: WebSocket,
  ): void {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MessageType.AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      encodeAwarenessUpdate(this.awareness, changedClients),
    );
    const binaryUpdate = encoding.toUint8Array(encoder);
    this.getClientsExceptSelf(origin).forEach((client) =>
      client.send(binaryUpdate),
    );
  }

  private handleSyncUpdate(update: Uint8Array, origin: WebSocket): void {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MessageType.SYNC);
    writeUpdate(encoder, update);
    const binaryUpdate = encoding.toUint8Array(encoder);
    this.getClientsExceptSelf(origin).forEach((client) =>
      client.send(binaryUpdate),
    );
  }

  public connect(client: WebSocket): void {
    this.clients.add(client);
  }

  public disconnect(client: WebSocket): void {
    if (this.clients.has(client)) {
      this.clients.delete(client);
    }
  }

  public getClients(): WebSocket[] {
    return [...this.clients];
  }

  public countClients(): number {
    return this.clients.size;
  }

  public getClientsExceptSelf(client: WebSocket): WebSocket[] {
    const otherClients = new Set(this.clients);
    otherClients.delete(client);
    return [...otherClients];
  }
}
