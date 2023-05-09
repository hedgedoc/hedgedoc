/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType, RealtimeUser } from '@hedgedoc/commons';
import { Listener } from 'eventemitter2';

import { RealtimeConnection } from './realtime-connection';
import { RealtimeNote } from './realtime-note';

/**
 * Saves the current realtime status of a specific client and sends updates of changes to other clients.
 */
export class RealtimeUserStatusAdapter {
  private readonly realtimeUser: RealtimeUser;

  constructor(
    username: string | null,
    displayName: string,
    private connection: RealtimeConnection,
    private acceptCursorUpdateProvider: () => boolean,
  ) {
    this.realtimeUser = this.createInitialRealtimeUserState(
      username,
      displayName,
      connection.getRealtimeNote(),
    );
    this.bindRealtimeUserStateEvents(connection);
  }

  private createInitialRealtimeUserState(
    username: string | null,
    displayName: string,
    realtimeNote: RealtimeNote,
  ): RealtimeUser {
    return {
      username: username,
      displayName: displayName,
      active: true,
      styleIndex: this.findLeastUsedStyleIndex(
        this.createStyleIndexToCountMap(realtimeNote),
      ),
      cursor: !this.acceptCursorUpdateProvider()
        ? null
        : {
            from: 0,
            to: 0,
          },
    };
  }

  private bindRealtimeUserStateEvents(connection: RealtimeConnection): void {
    const realtimeNote = connection.getRealtimeNote();
    const transporterMessagesListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_SINGLE_UPDATE,
      (message: Message<MessageType.REALTIME_USER_SINGLE_UPDATE>) => {
        this.realtimeUser.cursor = this.acceptCursorUpdateProvider()
          ? message.payload
          : null;
        this.sendRealtimeUserStatusUpdateEvent(connection);
      },
      { objectify: true },
    ) as Listener;
    const transporterRequestMessageListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_STATE_REQUEST,
      () => {
        this.sendCompleteStateToClient(connection);
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

    const realtimeUserSetActivityListener = connection.getTransporter().on(
      MessageType.REALTIME_USER_SET_ACTIVITY,
      (message: Message<MessageType.REALTIME_USER_SET_ACTIVITY>) => {
        if (this.realtimeUser.active === message.payload.active) {
          return;
        }
        this.realtimeUser.active = message.payload.active;
        this.sendRealtimeUserStatusUpdateEvent(connection);
      },
      { objectify: true },
    ) as Listener;

    connection.getTransporter().on('disconnected', () => {
      transporterMessagesListener?.off();
      transporterRequestMessageListener.off();
      clientRemoveListener.off();
      realtimeUserSetActivityListener.off();
    });
  }

  private sendRealtimeUserStatusUpdateEvent(
    exceptClient: RealtimeConnection,
  ): void {
    this.collectAllConnectionsExcept(exceptClient).forEach(
      this.sendCompleteStateToClient.bind(this),
    );
  }

  private sendCompleteStateToClient(receivingClient: RealtimeConnection): void {
    const realtimeUser =
      receivingClient.getRealtimeUserStateAdapter().realtimeUser;
    const realtimeUsers = this.collectAllConnectionsExcept(receivingClient)
      .map((client) => client.getRealtimeUserStateAdapter().realtimeUser)
      .filter((realtimeUser) => realtimeUser !== null);

    receivingClient.getTransporter().sendMessage({
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        users: realtimeUsers,
        ownUser: {
          displayName: realtimeUser.displayName,
          styleIndex: realtimeUser.styleIndex,
        },
      },
    });
  }

  private collectAllConnectionsExcept(
    exceptClient: RealtimeConnection,
  ): RealtimeConnection[] {
    return this.connection
      .getRealtimeNote()
      .getConnections()
      .filter(
        (client) =>
          client !== exceptClient && client.getTransporter().isReady(),
      );
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
          connection.getRealtimeUserStateAdapter().realtimeUser?.styleIndex,
      )
      .reduce((map, styleIndex) => {
        if (styleIndex !== undefined) {
          const count = (map.get(styleIndex) ?? 0) + 1;
          map.set(styleIndex, count);
        }
        return map;
      }, new Map<number, number>());
  }
}
