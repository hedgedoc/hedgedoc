/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MessageTransporter } from '../message-transporters/index.js'
import { Message, MessageType } from '../message-transporters/message.js'
import { InMemoryConnectionTransportAdapter } from './in-memory-connection-transport-adapter.js'
import { RealtimeDoc } from './realtime-doc.js'
import { YDocSyncClientAdapter } from './y-doc-sync-client-adapter.js'
import { YDocSyncServerAdapter } from './y-doc-sync-server-adapter.js'
import { describe, expect, it, beforeAll, jest, afterAll } from '@jest/globals'

describe('y-doc-sync-adapter', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  it('server client communication', async () => {
    const docServer: RealtimeDoc = new RealtimeDoc('This is a test note')
    const docClient1: RealtimeDoc = new RealtimeDoc()
    const docClient2: RealtimeDoc = new RealtimeDoc()

    const textServer = docServer.getMarkdownContentChannel()
    const textClient1 = docClient1.getMarkdownContentChannel()
    const textClient2 = docClient2.getMarkdownContentChannel()

    textServer.observe(() =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      console.log('textServer', new Date(), textServer.toString()),
    )
    textClient1.observe(() =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      console.log('textClient1', new Date(), textClient1.toString()),
    )
    textClient2.observe(() =>
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      console.log('textClient2', new Date(), textClient2.toString()),
    )

    const transporterAdapterServerTo1 = new InMemoryConnectionTransportAdapter(
      's>1',
    )
    const transporterAdapterServerTo2 = new InMemoryConnectionTransportAdapter(
      's>2',
    )
    const transporterAdapterClient1 = new InMemoryConnectionTransportAdapter(
      '1>s',
    )
    const transporterAdapterClient2 = new InMemoryConnectionTransportAdapter(
      '2>s',
    )

    const messageTransporterServerTo1 = new MessageTransporter()
    const messageTransporterServerTo2 = new MessageTransporter()
    const messageTransporterClient1 = new MessageTransporter()
    const messageTransporterClient2 = new MessageTransporter()

    messageTransporterServerTo1.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.log('Received NOTE_CONTENT_UPDATE from client 1 to server'),
    )
    messageTransporterServerTo2.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.log('Received NOTE_CONTENT_UPDATE from client 2 to server'),
    )
    messageTransporterClient1.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.log('Received NOTE_CONTENT_UPDATE from server to client 1'),
    )
    messageTransporterClient2.on(MessageType.NOTE_CONTENT_UPDATE, () =>
      console.log('Received NOTE_CONTENT_UPDATE from server to client 2'),
    )
    messageTransporterServerTo1.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.log('Received NOTE_CONTENT_REQUEST from client 1 to server'),
    )
    messageTransporterServerTo2.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.log('Received NOTE_CONTENT_REQUEST from client 2 to server'),
    )
    messageTransporterClient1.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.log('Received NOTE_CONTENT_REQUEST from server to client 1'),
    )
    messageTransporterClient2.on(MessageType.NOTE_CONTENT_STATE_REQUEST, () =>
      console.log('Received NOTE_CONTENT_REQUEST from server to client 2'),
    )
    messageTransporterClient1.doAsSoonAsConnected(() =>
      console.log('1>s is connected'),
    )
    messageTransporterClient2.doAsSoonAsConnected(() =>
      console.log('2>s is connected'),
    )
    messageTransporterServerTo1.doAsSoonAsConnected(() =>
      console.log('s>1 is connected'),
    )
    messageTransporterServerTo2.doAsSoonAsConnected(() =>
      console.log('s>2 is connected'),
    )
    messageTransporterClient1.doAsSoonAsReady(() => console.log('1>s is ready'))
    messageTransporterClient2.doAsSoonAsReady(() => console.log('2>s is ready'))
    messageTransporterServerTo1.doAsSoonAsReady(() =>
      console.log('s>1 is connected'),
    )
    messageTransporterServerTo2.doAsSoonAsReady(() =>
      console.log('s>2 is connected'),
    )

    docServer.on('update', (update: number[], origin: unknown) => {
      const message: Message<MessageType.NOTE_CONTENT_UPDATE> = {
        type: MessageType.NOTE_CONTENT_UPDATE,
        payload: update,
      }
      if (origin !== messageTransporterServerTo1) {
        console.log('YDoc on Server updated. Sending to Client 1')
        messageTransporterServerTo1.sendMessage(message)
      }
      if (origin !== messageTransporterServerTo2) {
        console.log('YDoc on Server updated. Sending to Client 2')
        messageTransporterServerTo2.sendMessage(message)
      }
    })
    docClient1.on('update', (update: number[], origin: unknown) => {
      if (origin !== messageTransporterClient1) {
        console.log('YDoc on client 1 updated. Sending to Server')
      }
    })
    docClient2.on('update', (update: number[], origin: unknown) => {
      if (origin !== messageTransporterClient2) {
        console.log('YDoc on client 2 updated. Sending to Server')
      }
    })

    const yDocSyncAdapter1 = new YDocSyncClientAdapter(
      messageTransporterClient1,
      docClient1,
    )
    const yDocSyncAdapter2 = new YDocSyncClientAdapter(
      messageTransporterClient2,
      docClient2,
    )

    const yDocSyncAdapterServerTo1 = new YDocSyncServerAdapter(
      messageTransporterServerTo1,
      docServer,
      () => true,
    )

    const yDocSyncAdapterServerTo2 = new YDocSyncServerAdapter(
      messageTransporterServerTo2,
      docServer,
      () => true,
    )

    const waitForClient1Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter1.doAsSoonAsSynced(() => {
        console.log('client 1 received the first sync')
        resolve()
      })
    })
    const waitForClient2Sync = new Promise<void>((resolve) => {
      yDocSyncAdapter2.doAsSoonAsSynced(() => {
        console.log('client 2 received the first sync')
        resolve()
      })
    })
    const waitForServerTo11Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo1.doAsSoonAsSynced(() => {
        console.log('server 1 received the first sync')
        resolve()
      })
    })
    const waitForServerTo21Sync = new Promise<void>((resolve) => {
      yDocSyncAdapterServerTo2.doAsSoonAsSynced(() => {
        console.log('server 2 received the first sync')
        resolve()
      })
    })

    transporterAdapterClient1.connect(transporterAdapterServerTo1)
    transporterAdapterClient2.connect(transporterAdapterServerTo2)

    messageTransporterClient1.setAdapter(transporterAdapterClient1)
    messageTransporterClient2.setAdapter(transporterAdapterClient2)
    messageTransporterServerTo1.setAdapter(transporterAdapterServerTo1)
    messageTransporterServerTo2.setAdapter(transporterAdapterServerTo2)

    messageTransporterClient1.markAsReady()
    messageTransporterClient2.markAsReady()
    messageTransporterServerTo1.markAsReady()
    messageTransporterServerTo2.markAsReady()

    jest.advanceTimersByTime(1000)

    expect(messageTransporterClient1.isReady()).toBeTruthy()
    expect(messageTransporterClient2.isReady()).toBeTruthy()
    expect(messageTransporterServerTo1.isReady()).toBeTruthy()
    expect(messageTransporterServerTo2.isReady()).toBeTruthy()

    yDocSyncAdapter1.requestDocumentState()
    yDocSyncAdapter2.requestDocumentState()

    await Promise.all([
      waitForClient1Sync,
      waitForClient2Sync,
      waitForServerTo11Sync,
      waitForServerTo21Sync,
    ])

    textClient1.insert(0, 'test2')
    textClient1.insert(0, 'test3')
    textClient2.insert(0, 'test4')

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    expect(textServer.toString()).toBe('test4test3test2This is a test note')
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    expect(textClient1.toString()).toBe('test4test3test2This is a test note')
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    expect(textClient2.toString()).toBe('test4test3test2This is a test note')

    docServer.destroy()
    docClient1.destroy()
    docClient2.destroy()
  })
})
