/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventEmitter2 } from 'eventemitter2';
import { Mock } from 'ts-mockery';

import { Note } from '../../../notes/note.entity';
import { MapType, RealtimeNote } from '../realtime-note';
import { WebsocketAwareness } from '../websocket-awareness';
import { WebsocketDoc } from '../websocket-doc';
import { mockAwareness } from './mock-awareness';
import { mockWebsocketDoc } from './mock-websocket-doc';

class MockRealtimeNote extends EventEmitter2<MapType> {
  constructor(
    private note: Note,
    private doc: WebsocketDoc,
    private awareness: WebsocketAwareness,
  ) {
    super();
  }

  public getNote(): Note {
    return this.note;
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

  public destroy(): void {
    //left blank for mock
  }
}

/**
 * Provides a partial mock for {@link RealtimeNote}
 * @param doc Defines the return value for `getYDoc`
 * @param awareness Defines the return value for `getAwareness`
 */
export function mockRealtimeNote(
  note?: Note,
  doc?: WebsocketDoc,
  awareness?: WebsocketAwareness,
): RealtimeNote {
  return Mock.from<RealtimeNote>(
    new MockRealtimeNote(
      note ?? Mock.of<Note>(),
      doc ?? mockWebsocketDoc(),
      awareness ?? mockAwareness(),
    ),
  );
}
