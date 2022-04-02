/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmitter } from 'events';
import { Mock } from 'ts-mockery';
import TypedEmitter from 'typed-emitter';

import { RealtimeNote, RealtimeNoteEvents } from '../realtime-note';
import { WebsocketAwareness } from '../websocket-awareness';
import { WebsocketDoc } from '../websocket-doc';

class MockRealtimeNote extends (EventEmitter as new () => TypedEmitter<RealtimeNoteEvents>) {
  constructor(
    private doc: WebsocketDoc,
    private awareness: WebsocketAwareness,
  ) {
    super();
  }

  public getYDoc(): WebsocketDoc {
    return this.doc;
  }

  public getAwareness(): WebsocketAwareness {
    return this.awareness;
  }

  public removeClient(): void {
    //left blank for mock
  }
}

/**
 * Provides a partial mock for {@link RealtimeNote}
 * @param doc Defines the return value for `getYDoc`
 * @param awareness Defines the return value for `getAwareness`
 */
export function mockRealtimeNote(
  doc: WebsocketDoc,
  awareness: WebsocketAwareness,
): RealtimeNote {
  return Mock.from<RealtimeNote>(new MockRealtimeNote(doc, awareness));
}
