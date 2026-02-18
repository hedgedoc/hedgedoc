// Export for browsers

'use strict';

// Operation are essentially lists of ops. There are three types of ops:
//
// * Retain ops: Advance the cursor position by a given number of characters.
//   Represented by positive ints.
// * Insert ops: Insert a given string at the current cursor position.
//   Represented by strings.
// * Delete ops: Delete the next n characters. Represented by negative ints.

type Op = number | string;

function isRetain(op: Op | undefined): op is number {
  return typeof op === 'number' && op > 0;
}

function isInsert(op: Op | undefined): op is string {
  return typeof op === 'string';
}

function isDelete(op: Op | undefined): op is number {
  return typeof op === 'number' && op < 0;
}

// Constructor for new operations.
class TextOperation {
  ops: Op[];
  baseLength: number;
  targetLength: number;

  static isRetain = isRetain;
  static isInsert = isInsert;
  static isDelete = isDelete;

  constructor() {
    // When an operation is applied to an input string, you can think of this as
    // if an imaginary cursor runs over the entire string and skips over some
    // parts, deletes some parts and inserts characters at some positions. These
    // actions (skip/delete/insert) are stored as an array in the "ops" property.
    this.ops = [];
    // An operation's baseLength is the length of every string the operation
    // can be applied to.
    this.baseLength = 0;
    // The targetLength is the length of every string that results from applying
    // the operation on a valid input string.
    this.targetLength = 0;
  }

  equals(other: TextOperation): boolean {
    if (this.baseLength !== other.baseLength) { return false; }
    if (this.targetLength !== other.targetLength) { return false; }
    if (this.ops.length !== other.ops.length) { return false; }
    for (let i = 0; i < this.ops.length; i++) {
      if (this.ops[i] !== other.ops[i]) { return false; }
    }
    return true;
  }

  // After an operation is constructed, the user of the library can specify the
  // actions of an operation (skip/insert/delete) with these three builder
  // methods. They all return the operation for convenient chaining.

  // Skip over a given number of characters.
  retain(n: number): this {
    if (typeof n !== 'number') {
      throw new Error("retain expects an integer");
    }
    if (n === 0) { return this; }
    this.baseLength += n;
    this.targetLength += n;
    if (isRetain(this.ops[this.ops.length - 1])) {
      // The last op is a retain op => we can merge them into one op.
      (this.ops[this.ops.length - 1] as number) += n;
    } else {
      // Create a new op.
      this.ops.push(n);
    }
    return this;
  }

  // Insert a string at the current position.
  insert(str: string): this {
    if (typeof str !== 'string') {
      throw new Error("insert expects a string");
    }
    if (str === '') { return this; }
    this.targetLength += str.length;
    const ops = this.ops;
    if (isInsert(ops[ops.length - 1])) {
      // Merge insert op.
      ops[ops.length - 1] += str;
    } else if (isDelete(ops[ops.length - 1])) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (isInsert(ops[ops.length - 2])) {
        ops[ops.length - 2] += str;
      } else {
        ops[ops.length] = ops[ops.length - 1];
        ops[ops.length - 2] = str;
      }
    } else {
      ops.push(str);
    }
    return this;
  }

  // Delete a string at the current position.
  delete(n: number | string): this {
    if (typeof n === 'string') { n = n.length; }
    if (typeof n !== 'number') {
      throw new Error("delete expects an integer or a string");
    }
    if (n === 0) { return this; }
    if (n > 0) { n = -n; }
    this.baseLength -= n;
    if (isDelete(this.ops[this.ops.length - 1])) {
      (this.ops[this.ops.length - 1] as number) += n;
    } else {
      this.ops.push(n);
    }
    return this;
  }

  // Tests whether this operation has no effect.
  isNoop(): boolean {
    return this.ops.length === 0 || (this.ops.length === 1 && isRetain(this.ops[0]));
  }

  // Pretty printing.
  toString(): string {
    // map: build a new array by applying a function to every element in an old
    // array.
    return this.ops.map(function (op) {
      if (isRetain(op)) {
        return "retain " + op;
      } else if (isInsert(op)) {
        return "insert '" + op + "'";
      } else {
        return "delete " + (-(op as number));
      }
    }).join(', ');
  }

  // Converts operation into a JSON value.
  toJSON(): Op[] {
    return this.ops;
  }

  // Converts a plain JS object into an operation and validates it.
  static fromJSON(ops: Op[]): TextOperation {
    const o = new TextOperation();
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (isRetain(op)) {
        o.retain(op);
      } else if (isInsert(op)) {
        o.insert(op);
      } else if (isDelete(op)) {
        o.delete(op);
      } else {
        throw new Error("unknown operation: " + JSON.stringify(op));
      }
    }
    return o;
  }

  // Apply an operation to a string, returning a new string. Throws an error if
  // there's a mismatch between the input string and the operation.
  apply(str: string): string {
    if (str.length !== this.baseLength) {
      throw new Error("The operation's base length must be equal to the string's length.");
    }
    const newStr: string[] = [];
    let j = 0;
    let strIndex = 0;
    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (isRetain(op)) {
        if (strIndex + op > str.length) {
          throw new Error("Operation can't retain more characters than are left in the string.");
        }
        // Copy skipped part of the old string.
        newStr[j++] = str.slice(strIndex, strIndex + op);
        strIndex += op;
      } else if (isInsert(op)) {
        // Insert string.
        newStr[j++] = op;
      } else { // delete op
        strIndex -= (op as number);
      }
    }
    if (strIndex !== str.length) {
      throw new Error("The operation didn't operate on the whole string.");
    }
    return newStr.join('');
  }

  // Computes the inverse of an operation. The inverse of an operation is the
  // operation that reverts the effects of the operation, e.g. when you have an
  // operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello ");
  // skip(6);'. The inverse should be used for implementing undo.
  invert(str: string): TextOperation {
    let strIndex = 0;
    const inverse = new TextOperation();
    const ops = this.ops;
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (isRetain(op)) {
        inverse.retain(op);
        strIndex += op;
      } else if (isInsert(op)) {
        inverse.delete(op.length);
      } else { // delete op
        inverse.insert(str.slice(strIndex, strIndex - (op as number)));
        strIndex -= (op as number);
      }
    }
    return inverse;
  }

  // Compose merges two consecutive operations into one operation, that
  // preserves the changes of both. Or, in other words, for each input string S
  // and a pair of consecutive operations A and B,
  // apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
  compose(operation2: TextOperation): TextOperation {
    const operation1 = this;
    if (operation1.targetLength !== operation2.baseLength) {
      throw new Error("The base length of the second operation has to be the target length of the first operation");
    }

    const operation = new TextOperation(); // the combined operation
    const ops1 = operation1.ops, ops2 = operation2.ops; // for fast access
    let i1 = 0, i2 = 0; // current index into ops1 respectively ops2
    let op1: Op | undefined = ops1[i1++], op2: Op | undefined = ops2[i2++]; // current ops
    while (true) {
      // Dispatch on the type of op1 and op2
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      if (isDelete(op1)) {
        operation.delete(op1);
        op1 = ops1[i1++];
        continue;
      }
      if (isInsert(op2)) {
        operation.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too short.");
      }
      if (typeof op2 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too long.");
      }

      if (isRetain(op1) && isRetain(op2)) {
        if (op1 > op2) {
          operation.retain(op2);
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          operation.retain(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.retain(op1);
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isDelete(op2)) {
        if (op1.length > -op2) {
          op1 = op1.slice(-op2);
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 + op1.length;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isRetain(op2)) {
        if (op1.length > op2) {
          operation.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          operation.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.insert(op1);
          op2 = op2 - op1.length;
          op1 = ops1[i1++];
        }
      } else if (isRetain(op1) && isDelete(op2)) {
        if (op1 > -op2) {
          operation.delete(op2);
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          operation.delete(op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.delete(op1);
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(
          "This shouldn't happen: op1: " +
          JSON.stringify(op1) + ", op2: " +
          JSON.stringify(op2)
        );
      }
    }
    return operation;
  }

  // When you use ctrl-z to undo your latest changes, you expect the program not
  // to undo every single keystroke but to undo your last sentence you wrote at
  // a stretch or the deletion you did by holding the backspace key down. This
  // This can be implemented by composing operations on the undo stack. This
  // method can help decide whether two operations should be composed. It
  // returns true if the operations are consecutive insert operations or both
  // operations delete text at the same position. You may want to include other
  // factors like the time since the last change in your decision.
  shouldBeComposedWith(other: TextOperation): boolean {
    if (this.isNoop() || other.isNoop()) { return true; }

    const startA = getStartIndex(this), startB = getStartIndex(other);
    const simpleA = getSimpleOp(this), simpleB = getSimpleOp(other);
    if (!simpleA || !simpleB) { return false; }

    if (isInsert(simpleA) && isInsert(simpleB)) {
      return startA + simpleA.length === startB;
    }

    if (isDelete(simpleA) && isDelete(simpleB)) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return (startB - simpleB === startA) || startA === startB;
    }

    return false;
  }

  // Decides whether two operations should be composed with each other
  // if they were inverted, that is
  // `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
  shouldBeComposedWithInverted(other: TextOperation): boolean {
    if (this.isNoop() || other.isNoop()) { return true; }

    const startA = getStartIndex(this), startB = getStartIndex(other);
    const simpleA = getSimpleOp(this), simpleB = getSimpleOp(other);
    if (!simpleA || !simpleB) { return false; }

    if (isInsert(simpleA) && isInsert(simpleB)) {
      return startA + simpleA.length === startB || startA === startB;
    }

    if (isDelete(simpleA) && isDelete(simpleB)) {
      return startB - simpleB === startA;
    }

    return false;
  }

  // Transform takes two operations A and B that happened concurrently and
  // produces two operations A' and B' (in an array) such that
  // `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
  // heart of OT.
  static transform(operation1: TextOperation, operation2: TextOperation): [TextOperation, TextOperation] {
    if (operation1.baseLength !== operation2.baseLength) {
      throw new Error("Both operations have to have the same base length");
    }

    const operation1prime = new TextOperation();
    const operation2prime = new TextOperation();
    const ops1 = operation1.ops, ops2 = operation2.ops;
    let i1 = 0, i2 = 0;
    let op1: Op | undefined = ops1[i1++], op2: Op | undefined = ops2[i2++];
    while (true) {
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.

      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (isInsert(op1)) {
        operation1prime.insert(op1);
        operation2prime.retain(op1.length);
        op1 = ops1[i1++];
        continue;
      }
      if (isInsert(op2)) {
        operation1prime.retain(op2.length);
        operation2prime.insert(op2);
        op2 = ops2[i2++];
        continue;
      }

      if (typeof op1 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too short.");
      }
      if (typeof op2 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too long.");
      }

      let minl: number;
      if (isRetain(op1) && isRetain(op2)) {
        // Simple case: retain/retain
        if (op1 > op2) {
          minl = op2;
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
        operation1prime.retain(minl);
        operation2prime.retain(minl);
      } else if (isDelete(op1) && isDelete(op2)) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (-op1 > -op2) {
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
      // next two cases: delete/retain and retain/delete
      } else if (isDelete(op1) && isRetain(op2)) {
        if (-op1 > op2) {
          minl = op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (-op1 === op2) {
          minl = op2;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = -op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation1prime.delete(minl);
      } else if (isRetain(op1) && isDelete(op2)) {
        if (op1 > -op2) {
          minl = -op2;
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          minl = op1;
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          minl = op1;
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
        operation2prime.delete(minl);
      } else {
        throw new Error("The two operations aren't compatible");
      }
    }

    return [operation1prime, operation2prime];
  }
}

function getSimpleOp(operation: TextOperation): Op | null {
  const ops = operation.ops;
  switch (ops.length) {
    case 1:
      return ops[0];
    case 2:
      return isRetain(ops[0]) ? ops[1] : (isRetain(ops[1]) ? ops[0] : null);
    case 3:
      if (isRetain(ops[0]) && isRetain(ops[2])) { return ops[1]; }
  }
  return null;
}

function getStartIndex(operation: TextOperation): number {
  if (isRetain(operation.ops[0])) { return operation.ops[0]; }
  return 0;
}

// Export for CommonJS
export = TextOperation;
