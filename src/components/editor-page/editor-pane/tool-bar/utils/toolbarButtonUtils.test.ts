/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import CodeMirror, { Editor, Position, Range } from 'codemirror'
import { EmojiClickEventDetail } from 'emoji-picker-element/shared'
import { Mock } from 'ts-mockery'
import {
  addCodeFences,
  addCollapsableBlock,
  addComment,
  addEmoji,
  addHeaderLevel,
  addImage,
  addLine,
  addLink,
  addList,
  addOrderedList,
  addQuotes,
  addTable,
  addTaskList,
  makeSelectionBold,
  makeSelectionItalic,
  markSelection,
  strikeThroughSelection,
  subscriptSelection,
  superscriptSelection,
  underlineSelection
} from './toolbarButtonUtils'

Mock.configure('jest')

const testContent = '1st line\n2nd line\n3rd line'

interface FromTo {
  to: CodeMirror.Position,
  from: CodeMirror.Position
}

const buildRanges = () => {
  const cursor: FromTo = {
    to: Mock.of<Position>({
      ch: 0,
      line: 0
    }),
    from: Mock.of<Position>({
      ch: 0,
      line: 0
    })
  }

  const firstLine: FromTo = {
    from: Mock.of<Position>({
      ch: 0,
      line: 0
    }),
    to: Mock.of<Position>({
      ch: 8,
      line: 0
    })
  }

  const multiline: FromTo = {
    from: Mock.of<Position>({
      ch: 0,
      line: 1
    }),
    to: Mock.of<Position>({
      ch: 8,
      line: 2
    })
  }

  const multilineOffset: FromTo = {
    from: Mock.of<Position>({
      ch: 4,
      line: 1
    }),
    to: Mock.of<Position>({
      ch: 4,
      line: 2
    })
  }
  return { cursor, firstLine, multiline, multilineOffset }
}

const buildEditor = (functions: Record<string, unknown>) => {
  return Mock.of<Editor>({
    getSelection: () => testContent,
    getRange: (from: Position, to: Position) => {
      const lines = testContent.split('\n')
      if (from.line === to.line) {
        return lines[from.line].slice(from.ch, to.ch)
      }
      let output = lines[from.line].slice(from.ch)
      for (let i = from.line + 1; i < to.line; i++) {
        output += lines[from.line]
      }
      output += lines[to.line].slice(0, to.ch)
      return output
    },
    setSelections: () => undefined,
    ...functions
  })
}


const mockListSelections = (positions: FromTo, empty: boolean): (() => CodeMirror.Range[]) => {
  return () => Mock.of<Range[]>([{
    anchor: positions.from,
    head: positions.to,
    from: () => positions.from,
    to: () => positions.to,
    empty: () => empty
  }])
}

const expectFromToReplacement = (position: FromTo, expectedReplacement: string, done: () => void): ((replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => void) => {
  return (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
    expect(from)
      .toEqual(position.from)
    expect(to)
      .toEqual(position.to)
    expect(replacement)
      .toEqual(expectedReplacement)
    done()
  }
}

describe('test makeSelectionBold', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    makeSelectionBold(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '**1st line**', done)
    })
    makeSelectionBold(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '**2nd line3rd line**', done)
    })
    makeSelectionBold(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '**line3rd **', done)
    })
    makeSelectionBold(editor)
  })
})

describe('test makeSelectionItalic', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    makeSelectionItalic(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '*1st line*', done)
    })
    makeSelectionItalic(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '*2nd line3rd line*', done)
    })
    makeSelectionItalic(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '*line3rd *', done)
    })
    makeSelectionItalic(editor)
  })
})

describe('test underlineSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    underlineSelection(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '++1st line++', done)
    })
    underlineSelection(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '++2nd line3rd line++', done)
    })
    underlineSelection(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '++line3rd ++', done)
    })
    underlineSelection(editor)
  })
})

describe('test strikeThroughSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    strikeThroughSelection(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '~~1st line~~', done)
    })
    strikeThroughSelection(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '~~2nd line3rd line~~', done)
    })
    strikeThroughSelection(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '~~line3rd ~~', done)
    })
    strikeThroughSelection(editor)
  })
})

describe('test subscriptSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    subscriptSelection(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '~1st line~', done)
    })
    subscriptSelection(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '~2nd line3rd line~', done)
    })
    subscriptSelection(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '~line3rd ~', done)
    })
    subscriptSelection(editor)
  })
})

describe('test superscriptSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    superscriptSelection(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '^1st line^', done)
    })
    superscriptSelection(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '^2nd line3rd line^', done)
    })
    superscriptSelection(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '^line3rd ^', done)
    })
    superscriptSelection(editor)
  })
})

describe('test markSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true)
    })
    markSelection(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '==1st line==', done)
    })
    markSelection(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '==2nd line3rd line==', done)
    })
    markSelection(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '==line3rd ==', done)
    })
    markSelection(editor)
  })
})

describe('test addHeaderLevel', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const noHeading = testContent.split('\n')[0]
  const firstHeading = `# ${ noHeading }`
  const secondHeading = `## ${ noHeading }`

  const firstLineNoHeading = testContent.split('\n')[1]
  const firstLineFirstHeading = `# ${ firstLineNoHeading }`

  it('no heading before', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(firstHeading)
        done()
      },
      getLine: (): string => (noHeading)
    })
    addHeaderLevel(editor)
  })

  it('level one heading before', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(secondHeading)
        done()
      },
      getLine: (): string => (firstHeading)
    })
    addHeaderLevel(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(firstLineFirstHeading)
        done()
      },
      getLine: (): string => (firstLineNoHeading)
    })
    addHeaderLevel(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(firstLineFirstHeading)
        done()
      },
      getLine: (): string => (firstLineNoHeading)
    })
    addHeaderLevel(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(firstLineFirstHeading)
        done()
      },
      getLine: (): string => (firstLineNoHeading)
    })
    addHeaderLevel(editor)
  })
})

describe('test addCodeFences', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor empty line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      getSelection: () => '',
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => '',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('```\n\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('just cursor nonempty line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      getSelection: () => '',
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => '1st line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('```\n1st line\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      getSelection: () => testContent,
      listSelections: mockListSelections(firstLine, false),
      replaceRange: expectFromToReplacement(firstLine, '```\n1st line\n```', done)
    })
    addCodeFences(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      getSelection: () => testContent,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '```\n2nd line3rd line\n```', done)
    })
    addCodeFences(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      getSelection: () => testContent,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '```\nline3rd \n```', done)
    })
    addCodeFences(editor)
  })
})

describe('test addQuotes', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`> ${ textFirstLine }`)
        done()
      }
    })
    addQuotes(editor)
    done()
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `> ${ textFirstLine }`, done)
    })
    addQuotes(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      replaceRange: expectFromToReplacement(multiline, '> 2nd line3rd line', done)
    })
    addQuotes(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      replaceRange: expectFromToReplacement(multilineOffset, '> line3rd ', done)
    })
    addQuotes(editor)
  })
})

describe('test unordered list', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]
  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`- ${ textFirstLine }`)
        done()
      }
    })
    addList(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `- ${ textFirstLine }`, done)
    })
    addList(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('- 2nd line3rd line')
        done()
      }
    })
    addList(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('- line3rd ')
        done()
      }
    })
    addList(editor)
  })
})
describe('test ordered list', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]
  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`1. ${ textFirstLine }`)
        done()
      }
    })
    addOrderedList(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `1. ${ textFirstLine }`, done)
    })
    addOrderedList(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('1. 2nd line3rd line')
        done()
      }
    })
    addOrderedList(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('1. line3rd ')
        done()
      }
    })
    addOrderedList(editor)
  })
})
describe('test todo list', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`- [ ] ${ textFirstLine }`)
        done()
      }
    })
    addTaskList(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `- [ ] ${ textFirstLine }`, done)
    })
    addTaskList(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('- [ ] 2nd line3rd line')
        done()
      }
    })
    addTaskList(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('- [ ] line3rd ')
        done()
      }
    })
    addTaskList(editor)
  })
})

describe('test addLink', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('[](https://)')
        done()
      }
    })
    addLink(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `[${ textFirstLine }](https://)`, done)
    })
    addLink(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('[2nd line3rd line](https://)')
        done()
      }
    })
    addLink(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('[line3rd ](https://)')
        done()
      }
    })
    addLink(editor)
  })
})

describe('test addImage', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('![](https://)')
        done()
      }
    })
    addImage(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `![${ textFirstLine }](https://)`, done)
    })
    addImage(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('![2nd line3rd line](https://)')
        done()
      }
    })
    addImage(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('![line3rd ](https://)')
        done()
      }
    })
    addImage(editor)
  })
})

describe('test addLine', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`${ textFirstLine }\n----`)
        done()
      }
    })
    addLine(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `${ textFirstLine }\n----`, done)
    })
    addLine(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n----')
        done()
      }
    })
    addLine(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n----')
        done()
      }
    })
    addLine(editor)
  })
})

describe('test collapsable block', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`${ textFirstLine }\n:::spoiler Toggle label\n  Toggled content\n:::`)
        done()
      }
    })
    addCollapsableBlock(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `${ textFirstLine }\n:::spoiler Toggle label\n  Toggled content\n:::`, done)
    })
    addCollapsableBlock(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n:::spoiler Toggle label\n  Toggled content\n:::')
        done()
      }
    })
    addCollapsableBlock(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n:::spoiler Toggle label\n  Toggled content\n:::')
        done()
      }
    })
    addCollapsableBlock(editor)
  })
})

describe('test addComment', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`${ textFirstLine }\n> []`)
        done()
      }
    })
    addComment(editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `${ textFirstLine }\n> []`, done)
    })
    addComment(editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n> []')
        done()
      }
    })
    addComment(editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual('2nd line\n> []')
        done()
      }
    })
    addComment(editor)
  })
})
describe('test addTable', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]
  const table = '|  # 1 |  # 2 |  # 3 |\n| ---- | ---- | ---- |\n| Text | Text | Text |'

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`${ textFirstLine }\n${ table }`)
        done()
      }
    })
    addTable(editor, 1, 3)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, `${ textFirstLine }\n${ table }`, done)
    })
    addTable(editor, 1, 3)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`2nd line\n${ table }`)
        done()
      }
    })
    addTable(editor, 1, 3)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(`2nd line\n${ table }`)
        done()
      }
    })
    addTable(editor, 1, 3)
  })
})

describe('test addEmoji with native emoji', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]
  const emoji = Mock.of<EmojiClickEventDetail>({
    emoji: {
      annotation: 'input numbers',
      group: 8,
      order: 3809,
      shortcodes: [
        '1234'
      ],
      tags: [
        '1234',
        'input',
        'numbers'
      ],
      unicode: '🔢',
      version: 0.6
    },
    unicode: '🔢'
  })

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(':1234:')
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, ':1234:', done)
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: expectFromToReplacement(multiline, ':1234:', done)
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: expectFromToReplacement(multilineOffset, ':1234:', done)
    })
    addEmoji(emoji, editor)
  })
})

describe('test addEmoji with native emoji', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]
  const forkAwesomeIcon = ':fa-star:'
  const emoji = Mock.of<EmojiClickEventDetail>({
    emoji: {
      name: 'fa-star',
      shortcodes: [
        'fa-star'
      ],
      url: '/img/forkawesome.png'
    },
    skinTone: 0,
    name: 'fa-star'
  })

  it('just cursor', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(cursor, true),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement)
          .toEqual(forkAwesomeIcon)
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('1st line', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(firstLine, false),
      getLine: (): string => (textFirstLine),
      replaceRange: expectFromToReplacement(firstLine, forkAwesomeIcon, done)
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multiline, false),
      getLine: (): string => '2nd line',
      replaceRange: expectFromToReplacement(multiline, forkAwesomeIcon, done)
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines with offset', done => {
    const editor = buildEditor({
      getCursor: () => cursor.from,
      listSelections: mockListSelections(multilineOffset, false),
      getLine: (): string => '2nd line',
      replaceRange: expectFromToReplacement(multilineOffset, forkAwesomeIcon, done)
    })
    addEmoji(emoji, editor)
  })
})

