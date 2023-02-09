/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MARKDOWN_CONTENT_CHANNEL_NAME } from './constants/markdown-content-channel-name.js'
import { encodeDocumentUpdateMessage } from './messages/document-update-message.js'
import { MessageType } from './messages/message-type.enum.js'
import { YDocMessageTransporter } from './y-doc-message-transporter.js'
import { describe, expect, it } from '@jest/globals'
import { Awareness } from 'y-protocols/awareness'
import { Doc } from 'yjs'

class InMemoryMessageTransporter extends YDocMessageTransporter {
  private otherSide: InMemoryMessageTransporter | undefined

  constructor(private name: string, doc: Doc, awareness: Awareness) {
    super(doc, awareness)
  }

  public connect(other: InMemoryMessageTransporter): void {
    this.setOtherSide(other)
    other.setOtherSide(this)
    this.onOpen()
    other.onOpen()
  }

  private setOtherSide(other: InMemoryMessageTransporter | undefined): void {
    this.otherSide = other
  }

  public disconnect(): void {
    this.onClose()
    this.setOtherSide(undefined)
    this.otherSide?.onClose()
    this.otherSide?.setOtherSide(undefined)
  }

  send(content: Uint8Array): void {
    if (this.otherSide === undefined) {
      throw new Error('Disconnected')
    }
    console.debug(`${this.name}`, 'Sending', content)
    this.otherSide?.decodeMessage(content)
  }

  public onOpen(): void {
    super.onOpen()
  }
}

describe('message transporter', () =>
  it('server client communication', () => {
    const docServer: Doc = new Doc()
    const docClient1: Doc = new Doc()
    const docClient2: Doc = new Doc()
    const dummyAwareness: Awareness = new Awareness(docServer)

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

    const transporterServerTo1 = new InMemoryMessageTransporter(
      's>1',
      docServer,
      dummyAwareness
    )
    const transporterServerTo2 = new InMemoryMessageTransporter(
      's>2',
      docServer,
      dummyAwareness
    )
    const transporterClient1 = new InMemoryMessageTransporter(
      '1>s',
      docClient1,
      dummyAwareness
    )
    const transporterClient2 = new InMemoryMessageTransporter(
      '2>s',
      docClient2,
      dummyAwareness
    )

    transporterServerTo1.on(String(MessageType.DOCUMENT_UPDATE), () =>
      console.debug('Received DOCUMENT_UPDATE from client 1 to server')
    )
    transporterServerTo2.on(String(MessageType.DOCUMENT_UPDATE), () =>
      console.debug('Received DOCUMENT_UPDATE from client 2 to server')
    )
    transporterClient1.on(String(MessageType.DOCUMENT_UPDATE), () =>
      console.debug('Received DOCUMENT_UPDATE from server to client 1')
    )
    transporterClient2.on(String(MessageType.DOCUMENT_UPDATE), () =>
      console.debug('Received DOCUMENT_UPDATE from server to client 2')
    )

    transporterServerTo1.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_ANSWER),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_ANSWER from client 1 to server'
        )
    )
    transporterServerTo2.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_ANSWER),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_ANSWER from client 2 to server'
        )
    )
    transporterClient1.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_ANSWER),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_ANSWER from server to client 1'
        )
    )
    transporterClient2.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_ANSWER),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_ANSWER from server to client 2'
        )
    )

    transporterServerTo1.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_REQUEST),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_REQUEST from client 1 to server'
        )
    )
    transporterServerTo2.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_REQUEST),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_REQUEST from client 2 to server'
        )
    )
    transporterClient1.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_REQUEST),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_REQUEST from server to client 1'
        )
    )
    transporterClient2.on(
      String(MessageType.COMPLETE_DOCUMENT_STATE_REQUEST),
      () =>
        console.debug(
          'Received COMPLETE_DOCUMENT_STATE_REQUEST from server to client 2'
        )
    )
    transporterClient1.on('ready', () => console.debug('Client 1 is ready'))
    transporterClient2.on('ready', () => console.debug('Client 2 is ready'))

    docServer.on('update', (update: Uint8Array, origin: unknown) => {
      const message = encodeDocumentUpdateMessage(update)
      if (origin !== transporterServerTo1) {
        console.debug('YDoc on Server updated. Sending to Client 1')
        transporterServerTo1.send(message)
      }
      if (origin !== transporterServerTo2) {
        console.debug('YDoc on Server updated. Sending to Client 2')
        transporterServerTo2.send(message)
      }
    })
    docClient1.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== transporterClient1) {
        console.debug('YDoc on client 1 updated. Sending to Server')
        transporterClient1.send(encodeDocumentUpdateMessage(update))
      }
    })
    docClient2.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== transporterClient2) {
        console.debug('YDoc on client 2 updated. Sending to Server')
        transporterClient2.send(encodeDocumentUpdateMessage(update))
      }
    })

    transporterClient1.connect(transporterServerTo1)
    transporterClient2.connect(transporterServerTo2)

    textClient1.insert(0, 'test2')
    textClient1.insert(0, 'test3')
    textClient2.insert(0, 'test4')

    expect(textServer.toString()).toBe('test4test3test2This is a test note')
    expect(textClient1.toString()).toBe('test4test3test2This is a test note')
    expect(textClient2.toString()).toBe('test4test3test2This is a test note')

    dummyAwareness.destroy()
    docServer.destroy()
    docClient1.destroy()
    docClient2.destroy()
  }))
