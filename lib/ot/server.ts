'use strict';

import config = require('../config');
import WrappedOperation = require('./wrapped-operation');

class Server {
  document: string;
  operations: WrappedOperation[];

  // Constructor. Takes the current document as a string and optionally the array
  // of all operations.
  constructor(document: string, operations?: WrappedOperation[]) {
    this.document = document;
    this.operations = operations || [];
  }

  // Call this method whenever you receive an operation from a client.
  receiveOperation(revision: number, operation: WrappedOperation): WrappedOperation | undefined {
    if (revision < 0 || this.operations.length < revision) {
      throw new Error("operation revision not in history");
    }
    // Find all operations that the client didn't know of when it sent the
    // operation ...
    const concurrentOperations = this.operations.slice(revision);

    // ... and transform the operation against all these operations ...
    const transform = (operation.constructor as typeof WrappedOperation).transform;
    for (let i = 0; i < concurrentOperations.length; i++) {
      operation = transform(operation, concurrentOperations[i])[0];
    }

    // ... and apply that on the document.
    const newDocument = operation.apply(this.document);
    // ignore if exceed the max length of document
    if (newDocument.length > config.documentMaxLength && newDocument.length > this.document.length)
      return;
    this.document = newDocument;
    // Store operation in history.
    this.operations.push(operation);

    // It's the caller's responsibility to send the operation to all connected
    // clients and an acknowledgement to the creator.
    return operation;
  }
}

export = Server;
