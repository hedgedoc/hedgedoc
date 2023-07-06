/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter, MessageType } from '@hedgedoc/commons';

/**
 * A message transporter that is only used in testing where certain conditions like resending of requests isn't needed.
 */
export class MockMessageTransporter extends MessageTransporter {
  protected startSendingOfReadyRequests(): void {
    this.sendMessage({
      type: MessageType.READY_REQUEST,
    });
  }

  protected stopSendingOfReadyRequests(): void {
    //intentionally left blank
  }
}
