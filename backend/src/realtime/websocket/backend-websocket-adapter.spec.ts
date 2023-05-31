/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConnectionState, Message, MessageType } from '@hedgedoc/commons';
import { Mock } from 'ts-mockery';
import WebSocket, { MessageEvent } from 'ws';

import { BackendWebsocketAdapter } from './backend-websocket-adapter';

describe('backend websocket adapter', () => {
  let sut: BackendWebsocketAdapter;
  let mockedSocket: WebSocket;

  function mockSocket(readyState: 0 | 1 | 2 | 3 = 0) {
    mockedSocket = Mock.of<WebSocket>({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn(),
      send: jest.fn(),
      readyState: readyState,
    });
    sut = new BackendWebsocketAdapter(mockedSocket);
  }

  beforeEach(() => {
    mockSocket(0);
  });

  it('can bind and unbind the close event', () => {
    const handler = jest.fn();
    const unbind = sut.bindOnCloseEvent(handler);
    expect(mockedSocket.addEventListener).toHaveBeenCalledWith(
      'close',
      handler,
    );
    unbind();
    expect(mockedSocket.removeEventListener).toHaveBeenCalledWith(
      'close',
      handler,
    );
  });

  it('can bind and unbind the connect event', () => {
    const handler = jest.fn();
    const unbind = sut.bindOnConnectedEvent(handler);
    expect(mockedSocket.addEventListener).toHaveBeenCalledWith('open', handler);
    unbind();
    expect(mockedSocket.removeEventListener).toHaveBeenCalledWith(
      'open',
      handler,
    );
  });

  it('can bind and unbind the error event', () => {
    const handler = jest.fn();
    const unbind = sut.bindOnErrorEvent(handler);
    expect(mockedSocket.addEventListener).toHaveBeenCalledWith(
      'error',
      handler,
    );
    unbind();
    expect(mockedSocket.removeEventListener).toHaveBeenCalledWith(
      'error',
      handler,
    );
  });

  it('can bind, unbind and translate the message event', () => {
    const handler = jest.fn();

    let modifiedHandler: (event: MessageEvent) => void = jest.fn();
    jest
      .spyOn(mockedSocket, 'addEventListener')
      .mockImplementation((event, handler_) => {
        modifiedHandler = handler_;
      });

    const unbind = sut.bindOnMessageEvent(handler);

    modifiedHandler(Mock.of<MessageEvent>({ data: new ArrayBuffer(0) }));
    expect(handler).toHaveBeenCalledTimes(0);

    modifiedHandler(Mock.of<MessageEvent>({ data: '{ "type": "READY" }' }));
    expect(handler).toHaveBeenCalledWith({ type: 'READY' });

    expect(mockedSocket.addEventListener).toHaveBeenCalledWith(
      'message',
      modifiedHandler,
    );
    unbind();
    expect(mockedSocket.removeEventListener).toHaveBeenCalledWith(
      'message',
      modifiedHandler,
    );
  });

  it('can disconnect the socket', () => {
    sut.disconnect();
    expect(mockedSocket.close).toHaveBeenCalled();
  });

  it('can send messages', () => {
    const value: Message<MessageType> = { type: MessageType.READY };
    sut.send(value);
    expect(mockedSocket.send).toHaveBeenCalledWith('{"type":"READY"}');
  });

  it('can read the connection state when open', () => {
    mockSocket(WebSocket.OPEN);
    expect(sut.getConnectionState()).toBe(ConnectionState.CONNECTED);
  });

  it('can read the connection state when connecting', () => {
    mockSocket(WebSocket.CONNECTING);
    expect(sut.getConnectionState()).toBe(ConnectionState.CONNECTING);
  });

  it('can read the connection state when closing', () => {
    mockSocket(WebSocket.CLOSING);
    expect(sut.getConnectionState()).toBe(ConnectionState.DISCONNECTED);
  });

  it('can read the connection state when closed', () => {
    mockSocket(WebSocket.CLOSED);
    expect(sut.getConnectionState()).toBe(ConnectionState.DISCONNECTED);
  });
});
