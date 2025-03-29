/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FrontendWebsocketAdapter } from './frontend-websocket-adapter'
import type { Message } from '@hedgedoc/commons'
import { ConnectionState, DisconnectReason, MessageType } from '@hedgedoc/commons'
import { Mock } from 'ts-mockery'

describe('frontend websocket', () => {
  let addEventListenerSpy: jest.Mock
  let removeEventListenerSpy: jest.Mock
  let closeSpy: jest.Mock
  let sendSpy: jest.Mock
  let adapter: FrontendWebsocketAdapter
  let mockedSocket: WebSocket

  function mockSocket(readyState: 0 | 1 | 2 | 3 = WebSocket.OPEN) {
    addEventListenerSpy = jest.fn()
    removeEventListenerSpy = jest.fn()
    closeSpy = jest.fn()
    sendSpy = jest.fn()

    mockedSocket = Mock.of<WebSocket>({
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      close: closeSpy,
      send: sendSpy,
      readyState: readyState
    })
    adapter = new FrontendWebsocketAdapter(mockedSocket)
  }

  it('can bind and unbind the close event', () => {
    mockSocket()
    const handler = jest.fn((reason?: DisconnectReason) => console.log(reason))

    let modifiedHandler: EventListenerOrEventListenerObject = jest.fn()

    jest.spyOn(mockedSocket, 'addEventListener').mockImplementation((event, handler_) => {
      modifiedHandler = handler_
    })

    const unbind = adapter.bindOnCloseEvent(handler)

    modifiedHandler(Mock.of<CloseEvent>({ code: DisconnectReason.USER_NOT_PERMITTED }))
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(DisconnectReason.USER_NOT_PERMITTED)

    unbind()

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })

  it('can bind and unbind the connect event', () => {
    mockSocket()
    const handler = jest.fn()
    const unbind = adapter.bindOnConnectedEvent(handler)
    expect(addEventListenerSpy).toHaveBeenCalledWith('open', handler)
    unbind()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('open', handler)
  })

  it('can bind and unbind the error event', () => {
    mockSocket()
    const handler = jest.fn()
    const unbind = adapter.bindOnErrorEvent(handler)
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', handler)
    unbind()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', handler)
  })

  it('can bind, unbind and translate the message event', () => {
    mockSocket()
    const handler = jest.fn()

    let modifiedHandler: EventListenerOrEventListenerObject = jest.fn()
    jest.spyOn(mockedSocket, 'addEventListener').mockImplementation((event, handler_) => {
      modifiedHandler = handler_
    })

    const unbind = adapter.bindOnMessageEvent(handler)

    modifiedHandler(Mock.of<MessageEvent>({ data: new ArrayBuffer(0) }))
    expect(handler).toHaveBeenCalledTimes(0)

    modifiedHandler(Mock.of<MessageEvent>({ data: '{ "type": "READY" }' }))
    expect(handler).toHaveBeenCalledWith({ type: 'READY' })

    expect(addEventListenerSpy).toHaveBeenCalledWith('message', modifiedHandler)
    unbind()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', modifiedHandler)
  })

  it('can disconnect the socket', () => {
    mockSocket()
    adapter.disconnect()
    expect(closeSpy).toHaveBeenCalled()
  })

  it('can send messages', () => {
    mockSocket()
    const value: Message<MessageType> = { type: MessageType.READY_REQUEST }
    adapter.send(value)
    expect(sendSpy).toHaveBeenCalledWith('{"type":"READY_REQUEST"}')
  })

  it('can read the connection state when open', () => {
    mockSocket(WebSocket.OPEN)
    expect(adapter.getConnectionState()).toBe(ConnectionState.CONNECTED)
  })

  it('can read the connection state when connecting', () => {
    mockSocket(WebSocket.CONNECTING)
    expect(adapter.getConnectionState()).toBe(ConnectionState.CONNECTING)
  })

  it('can read the connection state when closing', () => {
    mockSocket(WebSocket.CLOSING)
    expect(adapter.getConnectionState()).toBe(ConnectionState.DISCONNECTED)
  })

  it('can read the connection state when closed', () => {
    mockSocket(WebSocket.CLOSED)
    expect(adapter.getConnectionState()).toBe(ConnectionState.DISCONNECTED)
  })
})
