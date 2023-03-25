/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Message, MessageType } from '../message-transporters/message.js'
import { InMemoryConnectionMessageTransporter } from './in-memory-connection-message.transporter.js'
import { RealtimeDoc } from './realtime-doc.js'
import { YDocSyncClientAdapter } from './y-doc-sync-client-adapter.js'
import { YDocSyncServerAdapter } from './y-doc-sync-server-adapter.js'
import { describe, expect, it } from '@jest/globals'

describe('message transporter', () => {
  it('server client communication', async () => {
    const docServer: RealtimeDoc = new RealtimeDoc('This is a test note')
    const docClient1: RealtimeDoc = new RealtimeDoc()
    const docClient2: RealtimeDoc = new RealtimeDoc()

    const textServer = docServer.getMarkdownContentChannel()
    const textClient1 = docClient1.getMarkdownContentChannel()
    const textClient2 = docClient2.getMarkdownContentChannel()

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

    docServer.on('update', (update: number[], origin: unknown) => {
      const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
        type: MessageType.NOTE_CONTENT_UPDATE,
        payload: update
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
    docClient1.on('update', (update: number[], origin: unknown) => {
      if (origin !== transporterClient1) {
        console.debug('YDoc on client 1 updated. Sending to Server')
      }
    })
    docClient2.on('update', (update: number[], origin: unknown) => {
      if (origin !== transporterClient2) {
        console.debug('YDoc on client 2 updated. Sending to Server')
      }
    })

    const yDocSyncAdapter1 = new YDocSyncClientAdapter(
      transporterClient1,
      docClient1
    )
    const yDocSyncAdapter2 = new YDocSyncClientAdapter(
      transporterClient2,
      docClient2
    )

    const yDocSyncAdapterServerTo1 = new YDocSyncServerAdapter(
      transporterServerTo1,
      docServer
    )

    const yDocSyncAdapterServerTo2 = new YDocSyncServerAdapter(
      transporterServerTo2,
      docServer
    )

    const waitForClient1Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter1.doAsSoonAsSynced(() => {
        console.debug('client 1 received the first sync')
        resolve()
      })
    })
    const waitForClient2Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter2.doAsSoonAsSynced(() => {
        console.debug('client 2 received the first sync')
        resolve()
      })
    })
    const waitForServerTo11Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo1.doAsSoonAsSynced(() => {
        console.debug('server 1 received the first sync')
        resolve()
      })
    })
    const waitForServerTo21Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo2.doAsSoonAsSynced(() => {
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
