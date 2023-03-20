/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, MessageType, RealtimeUser } from '@hedgedoc/commons';
import { Listener } from 'eventemitter2';

import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';

export class RealtimeUserStatus {
  private readonly realtimeUser: RealtimeUser;

  constructor(
    displayName: string | undefined,
    private connection: RealtimeConnection,
  ) {
    this.realtimeUser = this.createInitialRealtimeUserState(
      displayName,
      connection.getRealtimeNote(),
    );
    this.bindRealtimeUserStateEvents(connection);
  }

  private createInitialRealtimeUserState(
    displayName: string | undefined,
    realtimeNote: RealtimeNote,
  ): RealtimeUser {
    return {
      username: displayName ?? this.generateGuestName(),
      active: true,
      styleIndex: this.findLeastUsedStyleIndex(
        this.createStyleIndexToCountMap(realtimeNote),
      ),
      cursor: {
        from: 0,
        to: 0,
      },
    };
  }

  private bindRealtimeUserStateEvents(connection: RealtimeConnection): void {
    const realtimeNote = connection.getRealtimeNote();
    const transporterMessagesListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_SINGLE_UPDATE,
      (message) => {
        this.realtimeUser.cursor = message.payload;
        this.sendRealtimeUserStatusUpdateEvent(connection);
      },
      { objectify: true },
    ) as Listener;

    const transporterRequestMessageListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_STATE_REQUEST,
      () => {
        this.sendUpdateToClient(connection);
      },
      { objectify: true },
    ) as Listener;

    const clientRemoveListener = realtimeNote.on(
      'clientRemoved',
      (client: RealtimeConnection) => {
        if (client === connection) {
          this.sendRealtimeUserStatusUpdateEvent(connection);
        }
      },
      {
        objectify: true,
      },
    ) as Listener;

    connection.getTransporter().on('disconnected', () => {
      transporterMessagesListener.off();
      transporterRequestMessageListener.off();
      clientRemoveListener.off();
    });
  }

  private sendRealtimeUserStatusUpdateEvent(
    exceptClient: RealtimeConnection,
  ): void {
    this.collectAllConnectionsExcept(exceptClient).forEach(
      this.sendUpdateToClient.bind(this),
    );
  }

  private sendUpdateToClient(client: RealtimeConnection): void {
    if (!client.getTransporter().isConnected()) {
      return;
    }
    const payload = this.collectAllConnectionsExcept(client).map(
      (client) => client.getRealtimeUserState().realtimeUser,
    );

    client.getTransporter().sendMessage({
      type: MessageType.REALTIME_USER_STATE_SET,
      payload,
    });
  }

  private collectAllConnectionsExcept(
    exceptClient: RealtimeConnection,
  ): RealtimeConnection[] {
    return this.connection
      .getRealtimeNote()
      .getConnections()
      .filter((client) => client !== exceptClient);
  }

  private generateGuestName(): string {
    return 'unknown';
  }

  private findLeastUsedStyleIndex(map: Map<number, number>): number {
    let leastUsedStyleIndex = 0;
    let leastUsedStyleIndexCount = map.get(0) ?? 0;
    for (let styleIndex = 0; styleIndex < 8; styleIndex++) {
      const count = map.get(styleIndex) ?? 0;
      if (count < leastUsedStyleIndexCount) {
        leastUsedStyleIndexCount = count;
        leastUsedStyleIndex = styleIndex;
      }
    }
    return leastUsedStyleIndex;
  }

  private createStyleIndexToCountMap(
    realtimeNote: RealtimeNote,
  ): Map<number, number> {
    return realtimeNote
      .getConnections()
      .map(
        (connection) =>
          connection.getRealtimeUserState().realtimeUser.styleIndex,
      )
      .reduce((map, styleIndex) => {
        const count = (map.get(styleIndex) ?? 0) + 1;
        map.set(styleIndex, count);
        return map;
      }, new Map<number, number>());
  }
}
