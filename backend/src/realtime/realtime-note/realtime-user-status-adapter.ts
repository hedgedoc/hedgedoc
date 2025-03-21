/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Message,
  MessageTransporter,
  MessageType,
  RealtimeUser,
} from '@hedgedoc/commons';
import { Listener } from 'eventemitter2';

export type OtherAdapterCollector = () => RealtimeUserStatusAdapter[];

/**
 * Saves the current realtime status of a specific client and sends updates of changes to other clients.
 */
export class RealtimeUserStatusAdapter {
  private readonly realtimeUser: RealtimeUser;

  constructor(
    private readonly username: string | null,
    private readonly displayName: string,
    private collectOtherAdapters: OtherAdapterCollector,
    private messageTransporter: MessageTransporter,
    private acceptCursorUpdateProvider: () => boolean,
  ) {
    this.realtimeUser = this.createInitialRealtimeUserState();
    this.bindRealtimeUserStateEvents();
  }

  private createInitialRealtimeUserState(): RealtimeUser {
    return {
      username: this.username,
      displayName: this.displayName,
      active: true,
      styleIndex: this.findLeastUsedStyleIndex(
        this.createStyleIndexToCountMap(),
      ),
      cursor: !this.acceptCursorUpdateProvider()
        ? null
        : {
            from: 0,
            to: 0,
          },
    };
  }

  private bindRealtimeUserStateEvents(): void {
    const transporterMessagesListener = this.messageTransporter.on(
      MessageType.REALTIME_USER_SINGLE_UPDATE,
      (message: Message<MessageType.REALTIME_USER_SINGLE_UPDATE>) => {
        this.realtimeUser.cursor = this.acceptCursorUpdateProvider()
          ? message.payload
          : null;
        this.collectOtherAdapters()
          .filter((adapter) => adapter !== this)
          .forEach((adapter) => adapter.sendCompleteStateToClient());
      },
      { objectify: true },
    ) as Listener;

    const transporterRequestMessageListener = this.messageTransporter.on(
      MessageType.REALTIME_USER_STATE_REQUEST,
      () => {
        this.sendCompleteStateToClient();
      },
      { objectify: true },
    ) as Listener;

    const clientRemoveListener = this.messageTransporter.on(
      'disconnected',
      () => {
        this.collectOtherAdapters()
          .filter((adapter) => adapter !== this)
          .forEach((adapter) => adapter.sendCompleteStateToClient());
      },
      {
        objectify: true,
      },
    ) as Listener;

    const realtimeUserSetActivityListener = this.messageTransporter.on(
      MessageType.REALTIME_USER_SET_ACTIVITY,
      (message: Message<MessageType.REALTIME_USER_SET_ACTIVITY>) => {
        if (this.realtimeUser.active === message.payload.active) {
          return;
        }
        this.realtimeUser.active = message.payload.active;
        this.collectOtherAdapters()
          .filter((adapter) => adapter !== this)
          .forEach((adapter) => adapter.sendCompleteStateToClient());
      },
      { objectify: true },
    ) as Listener;

    this.messageTransporter.on('disconnected', () => {
      transporterMessagesListener?.off();
      transporterRequestMessageListener.off();
      clientRemoveListener.off();
      realtimeUserSetActivityListener.off();
    });
  }

  private getSendableState(): RealtimeUser | undefined {
    return this.messageTransporter.isReady() ? this.realtimeUser : undefined;
  }

  public sendCompleteStateToClient(): void {
    if (!this.messageTransporter.isReady()) {
      return;
    }
    const realtimeUsers = this.collectOtherAdapters()
      .filter((adapter) => adapter !== this)
      .map((adapter) => adapter.getSendableState())
      .filter((value) => value !== undefined);

    this.messageTransporter.sendMessage({
      type: MessageType.REALTIME_USER_STATE_SET,
      payload: {
        users: realtimeUsers,
        ownUser: {
          displayName: this.realtimeUser.displayName,
          styleIndex: this.realtimeUser.styleIndex,
        },
      },
    });
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

  private createStyleIndexToCountMap(): Map<number, number> {
    return this.collectOtherAdapters()
      .map((adapter) => adapter.realtimeUser.styleIndex)
      .reduce((map, styleIndex) => {
        if (styleIndex !== undefined) {
          const count = (map.get(styleIndex) ?? 0) + 1;
          map.set(styleIndex, count);
        }
        return map;
      }, new Map<number, number>());
  }
}
