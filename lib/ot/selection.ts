// Export for browsers

'use strict';

import TextOperation = require('./text-operation');

// Range has `anchor` and `head` properties, which are zero-based indices into
// the document. The `anchor` is the side of the selection that stays fixed,
// `head` is the side of the selection where the cursor is. When both are
// equal, the range represents a cursor.
class Range {
  anchor: number;
  head: number;

  constructor(anchor: number, head: number) {
    this.anchor = anchor;
    this.head = head;
  }

  static fromJSON(obj: { anchor: number; head: number }): Range {
    return new Range(obj.anchor, obj.head);
  }

  equals(other: Range): boolean {
    return this.anchor === other.anchor && this.head === other.head;
  }

  isEmpty(): boolean {
    return this.anchor === this.head;
  }

  transform(other: TextOperation): Range {
    function transformIndex(index: number): number {
      let newIndex = index;
      const ops = other.ops;
      for (let i = 0, l = other.ops.length; i < l; i++) {
        if (TextOperation.isRetain(ops[i])) {
          index -= ops[i] as number;
        } else if (TextOperation.isInsert(ops[i])) {
          newIndex += (ops[i] as string).length;
        } else {
          newIndex -= Math.min(index, -(ops[i] as number));
          index += ops[i] as number;
        }
        if (index < 0) { break; }
      }
      return newIndex;
    }

    const newAnchor = transformIndex(this.anchor);
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor);
    }
    return new Range(newAnchor, transformIndex(this.head));
  }
}

// A selection is basically an array of ranges. Every range represents a real
// selection or a cursor in the document (when the start position equals the
// end position of the range). The array must not be empty.
class Selection {
  ranges: Range[];

  static Range = Range;

  constructor(ranges?: Range[]) {
    this.ranges = ranges || [];
  }

  // Convenience method for creating selections only containing a single cursor
  // and no real selection range.
  static createCursor(position: number): Selection {
    return new Selection([new Range(position, position)]);
  }

  static fromJSON(obj: { ranges?: { anchor: number; head: number }[] } | { anchor: number; head: number }[]): Selection {
    const objRanges = (obj as any).ranges || obj;
    const ranges: Range[] = [];
    for (let i = 0; i < objRanges.length; i++) {
      ranges[i] = Range.fromJSON(objRanges[i]);
    }
    return new Selection(ranges);
  }

  equals(other: Selection): boolean {
    if (this.ranges.length !== other.ranges.length) { return false; }
    // FIXME: Sort ranges before comparing them?
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].equals(other.ranges[i])) { return false; }
    }
    return true;
  }

  somethingSelected(): boolean {
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].isEmpty()) { return true; }
    }
    return false;
  }

  // Return the more current selection information.
  compose(other: Selection): Selection {
    return other;
  }

  // Update the selection with respect to an operation.
  transform(other: TextOperation): Selection {
    const newRanges: Range[] = [];
    for (let i = 0; i < this.ranges.length; i++) {
      newRanges[i] = this.ranges[i].transform(other);
    }
    return new Selection(newRanges);
  }
}

// Export for CommonJS
export = Selection;
