/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME } from '../constants/markdown-content-channel-name.js'
import {
  ConnectionState,
  MessageTransporter
} from '../message-transporters/message-transporter.js'
import { MessageType } from '../message-transporters/message.js'
import { Message } from '../message-transporters/message.js'
import { YDocSyncClient } from './y-doc-sync-client.js'
import { YDocSyncTestServer } from './y-doc-sync-test-server.js'
import { describe, expect, it } from '@jest/globals'
import { Doc } from 'yjs'

describe('message transporter', () => {
  it('server client communication', async () => {
    const docServer: Doc = new Doc()
    const docClient1: Doc = new Doc()
    const docClient2: Doc = new Doc()

    const textServer = docServer.getText(MARKDOWN_CONTENT_CHANNEL_NAME)
    const textClient1 = docClient1.getText(MARKDOWN_CONTENT_CHANNEL_NAME)
    const textClient2 = docClient2.getText(MARKDOWN_CONTENT_CHANNEL_NAME)

    textServer.insert(0, 'This is a test note')

    textServer.observe(() =>
      console.debug('textServer', new Date(), textServer.toString())
    )
    textClient1.observe(() =>
      console.debug('textClient1', new Date(), textClient1.toString())
    )
    textClient2.observe(() =>
      console.debug('textClient2', new Date(), textClient2.toString())
    )

    const transporterServerTo1 = new InMemoryConnectionMessageTransporter('s>1')
    const transporterServerTo2 = new InMemoryConnectionMessageTransporter('s>2')
    const transporterClient1 = new InMemoryConnectionMessageTransporter('1>s')
    const transporterClient2 = new InMemoryConnectionMessageTransporter('2>s')

    transporterServerTo1.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.debug('Received NOTE_CONTENT_UPDATE from client 1 to server')
    )
    transporterServerTo2.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.debug('Received NOTE_CONTENT_UPDATE from client 2 to server')
    )
    transporterClient1.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.debug('Received NOTE_CONTENT_UPDATE from server to client 1')
    )
    transporterClient2.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.debug('Received NOTE_CONTENT_UPDATE from server to client 2')
    )

    transporterServerTo1.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.debug('Received NOTE_CONTENT_REQUEST from client 1 to server')
    )
    transporterServerTo2.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.debug('Received NOTE_CONTENT_REQUEST from client 2 to server')
    )
    transporterClient1.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.debug('Received NOTE_CONTENT_REQUEST from server to client 1')
    )
    transporterClient2.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.debug('Received NOTE_CONTENT_REQUEST from server to client 2')
    )
    transporterClient1.on('connected', () => console.debug('1>s is connected'))
    transporterClient2.on('connected', () => console.debug('2>s is connected'))
    transporterServerTo1.on('connected', () =>
      console.debug('s>1 is connected')
    )
    transporterServerTo2.on('connected', () =>
      console.debug('s>2 is connected')
    )

    docServer.on('update', (update: Uint8Array, origin: unknown) => {
      const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
        type: MessageType.NOTE_CONTENT_UPDATE,
        payload: Array.from(update)
      }
      if (origin !== transporterServerTo1) {
        console.debug('YDoc on Server updated. Sending to Client 1')
        transporterServerTo1.sendMessage(message)
      }
      if (origin !== transporterServerTo2) {
        console.debug('YDoc on Server updated. Sending to Client 2')
        transporterServerTo2.sendMessage(message)
      }
    })
    docClient1.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== transporterClient1) {
        console.debug('YDoc on client 1 updated. Sending to Server')
      }
    })
    docClient2.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== transporterClient2) {
        console.debug('YDoc on client 2 updated. Sending to Server')
      }
    })

    const yDocSyncAdapter1 = new YDocSyncClient(docClient1, transporterClient1)
    const yDocSyncAdapter2 = new YDocSyncClient(docClient2, transporterClient2)
    const yDocSyncAdapterServerTo1 = new YDocSyncTestServer(
      docServer,
      transporterServerTo1
    )
    const yDocSyncAdapterServerTo2 = new YDocSyncTestServer(
      docServer,
      transporterServerTo2
    )

    const waitForClient1Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter1.asSoonAsConnected(() => {
        console.debug('client 1 received the first sync')
        resolve()
      })
    })
    const waitForClient2Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter2.asSoonAsConnected(() => {
        console.debug('client 2 received the first sync')
        resolve()
      })
    })
    const waitForServerTo11Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo1.asSoonAsConnected(() => {
        console.debug('server 1 received the first sync')
        resolve()
      })
    })
    const waitForServerTo21Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo2.asSoonAsConnected(() => {
        console.debug('server 2 received the first sync')
        resolve()
      })
    })

    transporterClient1.connect(transporterServerTo1)
    transporterClient2.connect(transporterServerTo2)

    yDocSyncAdapter1.requestDocumentState()
    yDocSyncAdapter2.requestDocumentState()

    await Promise.all([
      waitForClient1Sync,
      waitForClient2Sync,
      waitForServerTo11Sync,
      waitForServerTo21Sync
    ])

    textClient1.insert(0, 'test2')
    textClient1.insert(0, 'test3')
    textClient2.insert(0, 'test4')

    expect(textServer.toString()).toBe('test4test3test2This is a test note')
    expect(textClient1.toString()).toBe('test4test3test2This is a test note')
    expect(textClient2.toString()).toBe('test4test3test2This is a test note')

    docServer.destroy()
    docClient1.destroy()
    docClient2.destroy()
  })
})

class InMemoryConnectionMessageTransporter extends MessageTransporter {
  private otherSide: InMemoryConnectionMessageTransporter | undefined

  constructor(private name: string) {
    super()
  }

  public connect(other: InMemoryConnectionMessageTransporter): void {
    this.otherSide = other
    other.otherSide = this
    this.onConnected()
    other.onConnected()
  }

  public disconnect(): void {
    this.onDisconnecting()

    if (this.otherSide) {
      this.otherSide.onDisconnecting()
      this.otherSide.otherSide = undefined
      this.otherSide = undefined
    }
  }

  sendMessage(content: Message<MessageType>): void {
    if (this.otherSide === undefined) {
      throw new Error('Disconnected')
    }
    console.debug(`${this.name}`, 'Sending', content)
    this.otherSide?.receiveMessage(content)
  }

  getConnectionState(): ConnectionState {
    return this.otherSide !== undefined
      ? ConnectionState.CONNECTED
      : ConnectionState.DISCONNECT
  }
}
