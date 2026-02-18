// translation of https://github.com/djspiewak/cccp/blob/master/agent/src/main/scala/com/codecommit/cccp/agent/state.scala

'use strict';

import TextOperation = require('./text-operation');
import WrappedOperation = require('./wrapped-operation');

interface ClientState {
  applyClient(client: Client, operation: WrappedOperation): ClientState;
  applyServer(client: Client, revision: number, operation: WrappedOperation): ClientState;
  applyOperations?(client: Client, head: number, operations: (number | string)[][]): ClientState;
  serverAck(client: Client, revision: number): ClientState;
  transformSelection(selection: any): any;
  resend?(client: Client): void;
  getOperations?(): ClientState;
}

// Client constructor
class Client {
  revision: number;
  state: ClientState;

  static Synchronized: typeof Synchronized;
  static AwaitingConfirm: typeof AwaitingConfirm;
  static AwaitingWithBuffer: typeof AwaitingWithBuffer;
  static Stale: typeof Stale;
  static StaleWithBuffer: typeof StaleWithBuffer;

  constructor(revision: number) {
    this.revision = revision; // the next expected revision number
    this.state = synchronized_; // start state
  }

  setState(state: ClientState): void {
    this.state = state;
  }

  // Call this method when the user changes the document.
  applyClient(operation: WrappedOperation): void {
    this.setState(this.state.applyClient(this, operation));
  }

  // Call this method with a new operation from the server
  applyServer(revision: number, operation: WrappedOperation): void {
    this.setState(this.state.applyServer(this, revision, operation));
  }

  applyOperations(head: number, operations: (number | string)[][]): void {
    this.setState(this.state.applyOperations!(this, head, operations));
  }

  serverAck(revision: number): void {
    this.setState(this.state.serverAck(this, revision));
  }

  serverReconnect(): void {
    if (typeof this.state.resend === 'function') { this.state.resend(this); }
  }

  // Transforms a selection from the latest known server state to the current
  // client state. For example, if we get from the server the information that
  // another user's cursor is at position 3, but the server hasn't yet received
  // our newest operation, an insertion of 5 characters at the beginning of the
  // document, the correct position of the other user's cursor in our current
  // document is 8.
  transformSelection(selection: any): any {
    return this.state.transformSelection(selection);
  }

  // Override this method.
  sendOperation(revision: number, operation: WrappedOperation): void {
    throw new Error("sendOperation must be defined in child class");
  }

  // Override this method.
  applyOperation(operation: WrappedOperation): void {
    throw new Error("applyOperation must be defined in child class");
  }

  // Override this method.
  getOperations(base: number, head: number): void {
    throw new Error("getOperations must be defined in child class");
  }
}


// In the 'Synchronized' state, there is no pending operation that the client
// has sent to the server.
class Synchronized implements ClientState {
  applyClient(client: Client, operation: WrappedOperation): ClientState {
    // When the user makes an edit, send the operation to the server and
    // switch to the 'AwaitingConfirm' state
    client.sendOperation(client.revision, operation);
    return new AwaitingConfirm(operation);
  }

  applyServer(client: Client, revision: number, operation: WrappedOperation): ClientState {
    if (revision - client.revision > 1) {
      throw new Error("Invalid revision.");
    }
    client.revision = revision;
    // When we receive a new operation from the server, the operation can be
    // simply applied to the current document
    client.applyOperation(operation);
    return this;
  }

  serverAck(_client: Client, _revision: number): ClientState {
    throw new Error("There is no pending operation.");
  }

  // Nothing to do because the latest server state and client state are the same.
  transformSelection(x: any): any { return x; }
}

// Singleton
const synchronized_ = new Synchronized();


// In the 'AwaitingConfirm' state, there's one operation the client has sent
// to the server and is still waiting for an acknowledgement.
class AwaitingConfirm implements ClientState {
  outstanding: WrappedOperation;

  constructor(outstanding: WrappedOperation) {
    // Save the pending operation
    this.outstanding = outstanding;
  }

  applyClient(_client: Client, operation: WrappedOperation): ClientState {
    // When the user makes an edit, don't send the operation immediately,
    // instead switch to 'AwaitingWithBuffer' state
    return new AwaitingWithBuffer(this.outstanding, operation);
  }

  applyServer(client: Client, revision: number, operation: WrappedOperation): ClientState {
    if (revision - client.revision > 1) {
      throw new Error("Invalid revision.");
    }
    client.revision = revision;
    // This is another client's operation. Visualization:
    //
    //                   /\
    // this.outstanding /  \ operation
    //                 /    \
    //                 \    /
    //  pair[1]         \  / pair[0] (new outstanding)
    //  (can be applied  \/
    //  to the client's
    //  current document)
    const pair = (operation.constructor as typeof WrappedOperation).transform(this.outstanding, operation);
    client.applyOperation(pair[1]);
    return new AwaitingConfirm(pair[0]);
  }

  serverAck(client: Client, revision: number): ClientState {
    if (revision - client.revision > 1) {
      return new Stale(this.outstanding, client, revision).getOperations();
    }
    client.revision = revision;
    // The client's operation has been acknowledged
    // => switch to synchronized state
    return synchronized_;
  }

  transformSelection(selection: any): any {
    return selection.transform(this.outstanding);
  }

  resend(client: Client): void {
    // The confirm didn't come because the client was disconnected.
    // Now that it has reconnected, we resend the outstanding operation.
    client.sendOperation(client.revision, this.outstanding);
  }
}


// In the 'AwaitingWithBuffer' state, the client is waiting for an operation
// to be acknowledged by the server while buffering the edits the user makes
class AwaitingWithBuffer implements ClientState {
  outstanding: WrappedOperation;
  buffer: WrappedOperation;

  constructor(outstanding: WrappedOperation, buffer: WrappedOperation) {
    // Save the pending operation and the user's edits since then
    this.outstanding = outstanding;
    this.buffer = buffer;
  }

  applyClient(_client: Client, operation: WrappedOperation): ClientState {
    // Compose the user's changes onto the buffer
    const newBuffer = this.buffer.compose(operation);
    return new AwaitingWithBuffer(this.outstanding, newBuffer);
  }

  applyServer(client: Client, revision: number, operation: WrappedOperation): ClientState {
    if (revision - client.revision > 1) {
      throw new Error("Invalid revision.");
    }
    client.revision = revision;
    // Operation comes from another client
    //
    //                       /\
    //     this.outstanding /  \ operation
    //                     /    \
    //                    /\    /
    //       this.buffer /  \* / pair1[0] (new outstanding)
    //                  /    \/
    //                  \    /
    //          pair2[1] \  / pair2[0] (new buffer)
    // the transformed    \/
    // operation -- can
    // be applied to the
    // client's current
    // document
    //
    // * pair1[1]
    const transform = (operation.constructor as typeof WrappedOperation).transform;
    const pair1 = transform(this.outstanding, operation);
    const pair2 = transform(this.buffer, pair1[1]);
    client.applyOperation(pair2[1]);
    return new AwaitingWithBuffer(pair1[0], pair2[0]);
  }

  serverAck(client: Client, revision: number): ClientState {
    if (revision - client.revision > 1) {
      return new StaleWithBuffer(this.outstanding, this.buffer, client, revision).getOperations();
    }
    client.revision = revision;
    // The pending operation has been acknowledged
    // => send buffer
    client.sendOperation(client.revision, this.buffer);
    return new AwaitingConfirm(this.buffer);
  }

  transformSelection(selection: any): any {
    return selection.transform(this.outstanding).transform(this.buffer);
  }

  resend(client: Client): void {
    // The confirm didn't come because the client was disconnected.
    // Now that it has reconnected, we resend the outstanding operation.
    client.sendOperation(client.revision, this.outstanding);
  }
}


class Stale implements ClientState {
  acknowledged: WrappedOperation;
  client: Client;
  revision: number;

  constructor(acknowledged: WrappedOperation, client: Client, revision: number) {
    this.acknowledged = acknowledged;
    this.client = client;
    this.revision = revision;
  }

  applyClient(client: Client, operation: WrappedOperation): ClientState {
    return new StaleWithBuffer(this.acknowledged, operation, client, this.revision);
  }

  applyServer(_client: Client, _revision: number, _operation: WrappedOperation): ClientState {
    throw new Error("Ignored server-side change.");
  }

  applyOperations(client: Client, _head: number, operations: (number | string)[][]): ClientState {
    const transform = (this.acknowledged.constructor as typeof WrappedOperation).transform;
    for (let i = 0; i < operations.length; i++) {
      const op = TextOperation.fromJSON(operations[i]);
      const pair = transform(this.acknowledged, op as any);
      client.applyOperation(pair[1]);
      this.acknowledged = pair[0];
    }
    client.revision = this.revision;
    return synchronized_;
  }

  serverAck(_client: Client, _revision: number): ClientState {
    throw new Error("There is no pending operation.");
  }

  transformSelection(selection: any): any {
    return selection;
  }

  getOperations(): ClientState {
    this.client.getOperations(this.client.revision, this.revision - 1); // acknowlaged is the one at revision
    return this;
  }
}


class StaleWithBuffer implements ClientState {
  acknowledged: WrappedOperation;
  buffer: WrappedOperation;
  client: Client;
  revision: number;

  constructor(acknowledged: WrappedOperation, buffer: WrappedOperation, client: Client, revision: number) {
    this.acknowledged = acknowledged;
    this.buffer = buffer;
    this.client = client;
    this.revision = revision;
  }

  applyClient(client: Client, operation: WrappedOperation): ClientState {
    const buffer = this.buffer.compose(operation);
    return new StaleWithBuffer(this.acknowledged, buffer, client, this.revision);
  }

  applyServer(_client: Client, _revision: number, _operation: WrappedOperation): ClientState {
    throw new Error("Ignored server-side change.");
  }

  applyOperations(client: Client, _head: number, operations: (number | string)[][]): ClientState {
    const transform = (this.acknowledged.constructor as typeof WrappedOperation).transform;
    for (let i = 0; i < operations.length; i++) {
      const op = TextOperation.fromJSON(operations[i]);
      const pair1 = transform(this.acknowledged, op as any);
      const pair2 = transform(this.buffer, pair1[1]);
      client.applyOperation(pair2[1]);
      this.acknowledged = pair1[0];
      this.buffer = pair2[0];
    }
    client.revision = this.revision;
    client.sendOperation(client.revision, this.buffer);
    return new AwaitingConfirm(this.buffer);
  }

  serverAck(_client: Client, _revision: number): ClientState {
    throw new Error("There is no pending operation.");
  }

  transformSelection(selection: any): any {
    return selection;
  }

  getOperations(): ClientState {
    this.client.getOperations(this.client.revision, this.revision - 1); // acknowlaged is the one at revision
    return this;
  }
}

Client.Synchronized = Synchronized;
Client.AwaitingConfirm = AwaitingConfirm;
Client.AwaitingWithBuffer = AwaitingWithBuffer;
Client.Stale = Stale;
Client.StaleWithBuffer = StaleWithBuffer;

export = Client;
