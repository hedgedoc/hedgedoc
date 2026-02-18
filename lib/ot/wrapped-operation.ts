// Export for browsers

'use strict';

import TextOperation = require('./text-operation');

interface MetaWithInvert {
  invert(...args: any[]): any;
}

interface MetaWithCompose {
  compose(other: any): any;
}

interface MetaWithTransform {
  transform(operation: TextOperation): any;
}

type Meta = any;

// A WrappedOperation contains an operation and corresponing metadata.
class WrappedOperation {
  wrapped: TextOperation;
  meta: Meta;

  constructor(operation: TextOperation, meta?: Meta) {
    this.wrapped = operation;
    this.meta = meta;
  }

  apply(...args: [string]): string {
    return this.wrapped.apply(...args);
  }

  invert(...args: [string]): WrappedOperation {
    const meta = this.meta;
    return new WrappedOperation(
      this.wrapped.invert(...args),
      meta && typeof meta === 'object' && typeof meta.invert === 'function' ?
        meta.invert(...args) : meta
    );
  }

  compose(other: WrappedOperation): WrappedOperation {
    return new WrappedOperation(
      this.wrapped.compose(other.wrapped),
      composeMeta(this.meta, other.meta)
    );
  }

  static transform(a: WrappedOperation, b: WrappedOperation): [WrappedOperation, WrappedOperation] {
    const pair = TextOperation.transform(a.wrapped, b.wrapped);
    return [
      new WrappedOperation(pair[0], transformMeta(a.meta, b.wrapped)),
      new WrappedOperation(pair[1], transformMeta(b.meta, a.wrapped))
    ];
  }
}

// Copy all properties from source to target.
function copy(source: Record<string, any>, target: Record<string, any>): void {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
}

function composeMeta(a: Meta, b: Meta): Meta {
  if (a && typeof a === 'object') {
    if (typeof a.compose === 'function') { return a.compose(b); }
    const meta: Record<string, any> = {};
    copy(a, meta);
    copy(b, meta);
    return meta;
  }
  return b;
}

function transformMeta(meta: Meta, operation: TextOperation): Meta {
  if (meta && typeof meta === 'object') {
    if (typeof meta.transform === 'function') {
      return meta.transform(operation);
    }
  }
  return meta;
}

// Export for CommonJS
export = WrappedOperation;
