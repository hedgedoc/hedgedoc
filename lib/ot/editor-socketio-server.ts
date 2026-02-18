'use strict';

import { EventEmitter } from 'events';
import TextOperation = require('./text-operation');
import WrappedOperation = require('./wrapped-operation');
import Server = require('./server');
import Selection = require('./selection');

import logger from '../logger';

interface UserInfo {
  name?: string;
  color?: string;
  selection?: Selection;
}

interface Users {
  [clientId: string]: UserInfo;
}

class EditorSocketIOServer extends Server {
  users: Users;
  docId: string;
  mayWrite: (socket: any, cb: (allowed: boolean) => void) => void;
  operationCallback?: (socket: any, operation: any) => void;
  isDirty: boolean;

  constructor(
    document: string,
    operations: WrappedOperation[],
    docId: string,
    mayWrite?: (socket: any, cb: (allowed: boolean) => void) => void,
    operationCallback?: (socket: any, operation: any) => void
  ) {
    super(document, operations);
    this.users = {};
    this.docId = docId;
    this.mayWrite = mayWrite || function (_, cb) {
      cb(true);
    };
    this.operationCallback = operationCallback;
    this.isDirty = false;
  }

  addClient(socket: any): void {
    const self = this;
    socket.join(this.docId);
    const docOut = {
      str: this.document,
      revision: this.operations.length,
      clients: this.users
    };
    socket.emit('doc', docOut);
    socket.on('operation', function (revision: number, operation: any, selection: any) {
      socket.origin = 'operation';
      self.mayWrite(socket, function (mayWrite: boolean) {
        if (!mayWrite) {
          logger.info("User doesn't have the right to edit.");
          return;
        }
        try {
          self.onOperation(socket, revision, operation, selection);
          if (typeof self.operationCallback === 'function')
            self.operationCallback(socket, operation);
        } catch (err) {
          setTimeout(function () {
            const docOut = {
              str: self.document,
              revision: self.operations.length,
              clients: self.users,
              force: true
            };
            socket.emit('doc', docOut);
          }, 100);
        }
      });
    });
    socket.on('get_operations', function (base: number, head: number) {
      self.onGetOperations(socket, base, head);
    });
    socket.on('selection', function (obj: any) {
      socket.origin = 'selection';
      self.mayWrite(socket, function (mayWrite: boolean) {
        if (!mayWrite) {
          logger.info("User doesn't have the right to edit.");
          return;
        }
        self.updateSelection(socket, obj && Selection.fromJSON(obj));
      });
    });
    socket.on('disconnect', function () {
      logger.debug("Disconnect");
      socket.leave(self.docId);
      self.onDisconnect(socket);
      /*
      if (socket.manager && socket.manager.sockets.clients(self.docId).length === 0) {
        self.emit('empty-room');
      }
      */
    });
  }

  onOperation(socket: any, revision: number, operation: any, selection: any): void {
    let wrapped: WrappedOperation;
    try {
      wrapped = new WrappedOperation(
        TextOperation.fromJSON(operation),
        selection && Selection.fromJSON(selection)
      );
    } catch (exc) {
      logger.error("Invalid operation received: ");
      logger.error(exc as any);
      throw new Error(exc as any);
    }

    try {
      const clientId = socket.id;
      const wrappedPrime = this.receiveOperation(revision, wrapped);
      if (!wrappedPrime) return;
      logger.debug("new operation: " + JSON.stringify(wrapped));
      this.getClient(clientId).selection = wrappedPrime.meta;
      revision = this.operations.length;
      socket.emit('ack', revision);
      socket.broadcast.in(this.docId).emit(
        'operation', clientId, revision,
        wrappedPrime.wrapped.toJSON(), wrappedPrime.meta
      );
      //set document is dirty
      this.isDirty = true;
    } catch (exc) {
      logger.error(exc as any);
      throw new Error(exc as any);
    }
  }

  onGetOperations(socket: any, base: number, head: number): void {
    const operations = this.operations.slice(base, head).map(function (op: WrappedOperation) {
      return op.wrapped.toJSON();
    });
    socket.emit('operations', head, operations);
  }

  updateSelection(socket: any, selection: Selection | null): void {
    const clientId = socket.id;
    if (selection) {
      this.getClient(clientId).selection = selection;
    } else {
      delete this.getClient(clientId).selection;
    }
    socket.broadcast.to(this.docId).emit('selection', clientId, selection);
  }

  setName(socket: any, name: string): void {
    const clientId = socket.id;
    this.getClient(clientId).name = name;
    socket.broadcast.to(this.docId).emit('set_name', clientId, name);
  }

  setColor(socket: any, color: string): void {
    const clientId = socket.id;
    this.getClient(clientId).color = color;
    socket.broadcast.to(this.docId).emit('set_color', clientId, color);
  }

  getClient(clientId: string): UserInfo {
    return this.users[clientId] || (this.users[clientId] = {});
  }

  onDisconnect(socket: any): void {
    const clientId = socket.id;
    delete this.users[clientId];
    socket.broadcast.to(this.docId).emit('client_left', clientId);
  }
}

// Mixin EventEmitter methods (without overwriting the Server prototype chain)
Object.assign(EditorSocketIOServer.prototype, EventEmitter.prototype);

export = EditorSocketIOServer;
