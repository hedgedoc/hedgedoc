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

  /**
   * Creates a new realtime user status adapter.
   *
   * @param username the username of the user, or null if the user is a guest
   * @param displayName the display name of the user
   * @param authorStyle the style index of the author
   * @param collectOtherAdapters a function that returns all other adapters to send updates to
   * @param messageTransporter the message transporter to use for sending messages
   * @param acceptCursorUpdateProvider a function that returns whether cursor updates should be accepted
   */
  constructor(
    private readonly username: string | null,
    private readonly displayName: string,
    private readonly authorStyle: number,
    private collectOtherAdapters: OtherAdapterCollector,
    private messageTransporter: MessageTransporter,
    private acceptCursorUpdateProvider: () => boolean,
  ) {
    this.realtimeUser = this.createInitialRealtimeUserState();
    this.bindRealtimeUserStateEvents();
  }

  /**
   * Returns the current realtime user state
   *
   * @returns the current realtime user state
   */
  private createInitialRealtimeUserState(): RealtimeUser {
    return {
      username: this.username,
      displayName: this.displayName,
      active: true,
      styleIndex: this.authorStyle,
      cursor: !this.acceptCursorUpdateProvider()
        ? null
        : {
            from: 0,
            to: 0,
          },
    };
  }

  /**
   * Registers the listeners for the realtime user state events
   */
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

  /**
   * Gets the current real-time user state if the message transporter is ready
   *
   * @returns the current real-time user state or undefined if the transporter is not ready
   */
  private getSendableState(): RealtimeUser | undefined {
    return this.messageTransporter.isReady() ? this.realtimeUser : undefined;
  }

  /**
   * Sends the current real-time user state to all other clients
   * This includes the own user state and the states of all other users
   */
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
}
