import { EventEmitter } from 'events'
import { logger } from '../logger'
import { SocketWithNoteId } from '../realtime'
import Selection from './selection'
import Server from './server'
import TextOperation from './text-operation'
import WrappedOperation from './wrapped-operation'

export class EditorSocketIOServer extends Server {
  private readonly users: {}
  private readonly docId: any
  private mayWrite: (socket: SocketWithNoteId, originIsOperation: boolean, callback: (mayEdit: boolean) => void) => void

  constructor (document, operations, docId, mayWrite, operationCallback) {
    super(document, operations)
    // Whatever that does?
    EventEmitter.call(this)
    this.users = {}
    this.docId = docId
    this.mayWrite = mayWrite || function (_, originIsOperation, cb) {
      cb(true)
    }
    this.operationCallback = operationCallback
  }

  addClient (socket) {
    const self = this
    socket.join(this.docId)
    const docOut = {
      str: this.document,
      revision: this.operations.length,
      clients: this.users
    }
    socket.emit('doc', docOut)
    socket.on('operation', function (revision, operation, selection) {
      self.mayWrite(socket, true, function (mayWrite) {
        if (!mayWrite) {
          logger.info("User doesn't have the right to edit.")
          return
        }
        try {
          self.onOperation(socket, revision, operation, selection)
          if (typeof self.operationCallback === 'function')
            self.operationCallback(socket, operation)
        } catch (err) {
          setTimeout(function () {
            const docOut = {
              str: self.document,
              revision: self.operations.length,
              clients: self.users,
              force: true
            }
            socket.emit('doc', docOut)
          }, 100)
        }
      })
    })
    socket.on('get_operations', function (base, head) {
      self.onGetOperations(socket, base, head)
    })
    socket.on('selection', function (obj) {
      self.mayWrite(socket, false, function (mayWrite) {
        if (!mayWrite) {
          logger.info("User doesn't have the right to edit.")
          return
        }
        self.updateSelection(socket, obj && Selection.fromJSON(obj))
      })
    })
    socket.on('disconnect', function () {
      logger.debug("Disconnect")
      socket.leave(self.docId)
      self.onDisconnect(socket)
      /*
      if (socket.manager && socket.manager.sockets.clients(self.docId).length === 0) {
        self.emit('empty-room');
      }
      */
    })
  };

  onOperation (socket, revision, operation, selection) {
    let wrapped
    try {
      wrapped = new WrappedOperation(
        TextOperation.fromJSON(operation),
        selection && Selection.fromJSON(selection)
      )
    } catch (exc) {
      logger.error("Invalid operation received: ")
      logger.error(exc)
      throw new Error(exc)
    }

    try {
      const clientId = socket.id
      const wrappedPrime = this.receiveOperation(revision, wrapped)
      if (!wrappedPrime) return
      logger.debug("new operation: " + JSON.stringify(wrapped))
      this.getClient(clientId).selection = wrappedPrime.meta
      revision = this.operations.length
      socket.emit('ack', revision)
      socket.broadcast.in(this.docId).emit(
        'operation', clientId, revision,
        wrappedPrime.wrapped.toJSON(), wrappedPrime.meta
      )
      //set document is dirty
      this.isDirty = true
    } catch (exc) {
      logger.error(exc)
      throw new Error(exc)
    }
  };

  onGetOperations (socket, base, head) {
    const operations = this.operations.slice(base, head).map(function (op) {
      return op.wrapped.toJSON()
    })
    socket.emit('operations', head, operations)
  };

  updateSelection (socket, selection) {
    const clientId = socket.id
    if (selection) {
      this.getClient(clientId).selection = selection
    } else {
      delete this.getClient(clientId).selection
    }
    socket.broadcast.to(this.docId).emit('selection', clientId, selection)
  };

  setName (socket, name) {
    const clientId = socket.id
    this.getClient(clientId).name = name
    socket.broadcast.to(this.docId).emit('set_name', clientId, name)
  };

  setColor (socket, color) {
    const clientId = socket.id
    this.getClient(clientId).color = color
    socket.broadcast.to(this.docId).emit('set_color', clientId, color)
  };

  getClient (clientId) {
    return this.users[clientId] || (this.users[clientId] = {})
  };

  onDisconnect (socket) {
    const clientId = socket.id
    delete this.users[clientId]
    socket.broadcast.to(this.docId).emit('client_left', clientId)
  };
}

