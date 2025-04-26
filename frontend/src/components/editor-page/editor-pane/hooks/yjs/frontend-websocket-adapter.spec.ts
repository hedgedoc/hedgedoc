/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FrontendWebsocketAdapter } from './frontend-websocket-adapter'
import type { Message } from '@hedgedoc/commons'
import { ConnectionState, DisconnectReason, MessageType } from '@hedgedoc/commons'
import { Mock } from 'ts-mockery'
import { describe, expect, it, vi, MockInstance, Mock as ViMock } from 'vitest'

interface MockedSocket {
  addEventListenerSpy: ViMock
  removeEventListenerSpy: ViMock
  closeSpy: ViMock
  sendSpy: ViMock
  adapter: FrontendWebsocketAdapter
  socket: WebSocket
}

describe('frontend websocket', () => {
  function mockSocket(readyState: 0 | 1 | 2 | 3 = WebSocket.OPEN): MockedSocket {
    const addEventListenerSpy = vi.fn()
    const removeEventListenerSpy = vi.fn()
    const closeSpy = vi.fn()
    const sendSpy = vi.fn()

    const socket = Mock.of<WebSocket>({
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      close: closeSpy,
      send: sendSpy,
      readyState: readyState
    })
    const adapter = new FrontendWebsocketAdapter(socket)
    return {
      adapter,
      addEventListenerSpy,
      removeEventListenerSpy,
      closeSpy,
      sendSpy,
      socket
    }
  }

  it('can bind and unbind the close event', () => {
    const { adapter, socket, removeEventListenerSpy } = mockSocket()
    const handler = vi.fn((reason?: DisconnectReason) => console.log(reason))

    let modifiedHandler: EventListenerOrEventListenerObject = vi.fn()

    vi.spyOn(socket, 'addEventListener').mockImplementation((event, handler_) => {
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
    const { adapter, addEventListenerSpy, removeEventListenerSpy } = mockSocket()
    const handler = vi.fn()
    const unbind = adapter.bindOnConnectedEvent(handler)
    expect(addEventListenerSpy).toHaveBeenCalledWith('open', handler)
    unbind()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('open', handler)
  })

  it('can bind and unbind the error event', () => {
    const { adapter, addEventListenerSpy, removeEventListenerSpy } = mockSocket()
    const handler = vi.fn()
    const unbind = adapter.bindOnErrorEvent(handler)
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', handler)
    unbind()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', handler)
  })

  it('can bind, unbind and translate the message event', () => {
    const { adapter, socket, addEventListenerSpy, removeEventListenerSpy } = mockSocket()
    const handler = vi.fn()

    let modifiedHandler: EventListenerOrEventListenerObject = vi.fn()
    addEventListenerSpy.mockImplementation((event, handler_) => {
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
    const { adapter, closeSpy } = mockSocket()
    adapter.disconnect()
    expect(closeSpy).toHaveBeenCalled()
  })

  it('can send messages', () => {
    const { adapter, sendSpy } = mockSocket()
    const value: Message<MessageType> = { type: MessageType.READY_REQUEST }
    adapter.send(value)
    expect(sendSpy).toHaveBeenCalledWith('{"type":"READY_REQUEST"}')
  })

  it('can read the connection state when open', () => {
    const { adapter } = mockSocket(WebSocket.OPEN)
    expect(adapter.getConnectionState()).toBe(ConnectionState.CONNECTED)
  })

  it('can read the connection state when connecting', () => {
    const { adapter } = mockSocket(WebSocket.CONNECTING)
    expect(adapter.getConnectionState()).toBe(ConnectionState.CONNECTING)
  })

  it('can read the connection state when closing', () => {
    const { adapter } = mockSocket(WebSocket.CLOSING)
    expect(adapter.getConnectionState()).toBe(ConnectionState.DISCONNECTED)
  })

  it('can read the connection state when closed', () => {
    const { adapter } = mockSocket(WebSocket.CLOSED)
    expect(adapter.getConnectionState()).toBe(ConnectionState.DISCONNECTED)
  })
})
