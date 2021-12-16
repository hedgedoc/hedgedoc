/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import WebSocket from 'ws';
import { Awareness } from 'y-protocols/awareness';
import Y from 'yjs';

export class MultiClientAwareYDoc extends Y.Doc {
  private clients = new Set<WebSocket>();
  private awareness = new Awareness(this);

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

  public getClientsExceptSelf(client: WebSocket): WebSocket[] {
    const otherClients = new Set(this.clients);
    otherClients.delete(client);
    return [...otherClients];
  }
}
