import { Editor, Position, Range } from 'codemirror'
import { EmojiData } from 'emoji-mart'
import { Mock } from 'ts-mockery'
import {
  addCodeFences,
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

const editor = Mock.of<Editor>({
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
  setSelections: () => undefined
})

const buildRanges = () => {
  const cursor = {
    to: Mock.of<Position>({
      ch: 0,
      line: 0
    }),
    from: Mock.of<Position>({
      ch: 0,
      line: 0
    })
  }

  const firstLine = {
    from: Mock.of<Position>({
      ch: 0,
      line: 0
    }),
    to: Mock.of<Position>({
      ch: 8,
      line: 0
    })
  }

  const multiline = {
    from: Mock.of<Position>({
      ch: 0,
      line: 1
    }),
    to: Mock.of<Position>({
      ch: 8,
      line: 2
    })
  }

  const multilineOffset = {
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

describe('test makeSelectionBold', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    makeSelectionBold(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('**1st line**')
        done()
      }
    })
    makeSelectionBold(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('**2nd line3rd line**')
        done()
      }
    })
    makeSelectionBold(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('**line3rd **')
        done()
      }
    })
    makeSelectionBold(editor)
  })
})

describe('test makeSelectionItalic', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    makeSelectionItalic(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('*1st line*')
        done()
      }
    })
    makeSelectionItalic(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('*2nd line3rd line*')
        done()
      }
    })
    makeSelectionItalic(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('*line3rd *')
        done()
      }
    })
    makeSelectionItalic(editor)
  })
})

describe('test underlineSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    underlineSelection(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('++1st line++')
        done()
      }
    })
    underlineSelection(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('++2nd line3rd line++')
        done()
      }
    })
    underlineSelection(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('++line3rd ++')
        done()
      }
    })
    underlineSelection(editor)
  })
})

describe('test strikeThroughSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    strikeThroughSelection(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('~~1st line~~')
        done()
      }
    })
    strikeThroughSelection(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('~~2nd line3rd line~~')
        done()
      }
    })
    strikeThroughSelection(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('~~line3rd ~~')
        done()
      }
    })
    strikeThroughSelection(editor)
  })
})

describe('test subscriptSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    subscriptSelection(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('~1st line~')
        done()
      }
    })
    subscriptSelection(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('~2nd line3rd line~')
        done()
      }
    })
    subscriptSelection(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('~line3rd ~')
        done()
      }
    })
    subscriptSelection(editor)
  })
})

describe('test superscriptSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    superscriptSelection(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('^1st line^')
        done()
      }
    })
    superscriptSelection(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('^2nd line3rd line^')
        done()
      }
    })
    superscriptSelection(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('^line3rd ^')
        done()
      }
    })
    superscriptSelection(editor)
  })
})

describe('test markSelection', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      )
    })
    markSelection(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('==1st line==')
        done()
      }
    })
    markSelection(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('==2nd line3rd line==')
        done()
      }
    })
    markSelection(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('==line3rd ==')
        done()
      }
    })
    markSelection(editor)
  })
})

describe('test addHeaderLevel', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  Mock.extend(editor).with({
    getCursor: () => (cursor.from)
  })

  const noHeading = testContent.split('\n')[0]
  const firstHeading = `# ${noHeading}`
  const secondHeading = `## ${noHeading}`

  const firstLineNoHeading = testContent.split('\n')[1]
  const firstLineFirstHeading = `# ${firstLineNoHeading}`

  it('no heading before', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(firstHeading)
        done()
      },
      getLine: (): string => (noHeading)
    })
    addHeaderLevel(editor)
  })

  it('level one heading before', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(secondHeading)
        done()
      },
      getLine: (): string => (firstHeading)
    })
    addHeaderLevel(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(firstLineFirstHeading)
        done()
      },
      getLine: (): string => (firstLineNoHeading)
    })
    addHeaderLevel(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(firstLineFirstHeading)
        done()
      },
      getLine: (): string => (firstLineNoHeading)
    })
    addHeaderLevel(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(firstLineFirstHeading)
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
    Mock.extend(editor).with({
      getSelection: () => '',
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => '',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('```\n\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('just cursor nonempty line', done => {
    Mock.extend(editor).with({
      getSelection: () => '',
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => '1st line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('```\n1st line\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      getSelection: () => testContent,
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual('```\n1st line\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      getSelection: () => testContent,
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('```\n2nd line3rd line\n```')
        done()
      }
    })
    addCodeFences(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      getSelection: () => testContent,
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('```\nline3rd \n```')
        done()
      }
    })
    addCodeFences(editor)
  })
})

describe('test addQuotes', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()

  const textFirstLine = testContent.split('\n')[0]

  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`> ${textFirstLine}`)
        done()
      }
    })
    addQuotes(editor)
    done()
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`> ${textFirstLine}`)
        done()
      }
    })
    addQuotes(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual('> 2nd line3rd line')
        done()
      }
    })
    addQuotes(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual('> line3rd ')
        done()
      }
    })
    addQuotes(editor)
  })
})

describe('test unordered list', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  const textFirstLine = testContent.split('\n')[0]
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`- ${textFirstLine}`)
        done()
      }
    })
    addList(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`- ${textFirstLine}`)
        done()
      }
    })
    addList(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('- 2nd line3rd line')
        done()
      }
    })
    addList(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('- line3rd ')
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
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`1. ${textFirstLine}`)
        done()
      }
    })
    addOrderedList(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`1. ${textFirstLine}`)
        done()
      }
    })
    addOrderedList(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('1. 2nd line3rd line')
        done()
      }
    })
    addOrderedList(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('1. line3rd ')
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
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`- [ ] ${textFirstLine}`)
        done()
      }
    })
    addTaskList(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`- [ ] ${textFirstLine}`)
        done()
      }
    })
    addTaskList(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('- [ ] 2nd line3rd line')
        done()
      }
    })
    addTaskList(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('- [ ] line3rd ')
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
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('[](https://)')
        done()
      }
    })
    addLink(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`[${textFirstLine}](https://)`)
        done()
      }
    })
    addLink(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('[2nd line3rd line](https://)')
        done()
      }
    })
    addLink(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('[line3rd ](https://)')
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
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('![](https://)')
        done()
      }
    })
    addImage(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`![${textFirstLine}](https://)`)
        done()
      }
    })
    addImage(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('![2nd line3rd line](https://)')
        done()
      }
    })
    addImage(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('![line3rd ](https://)')
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
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`${textFirstLine}\n----`)
        done()
      }
    })
    addLine(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`${textFirstLine}\n----`)
        done()
      }
    })
    addLine(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('2nd line\n----')
        done()
      }
    })
    addLine(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('2nd line\n----')
        done()
      }
    })
    addLine(editor)
  })
})
describe('test addComment', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  const textFirstLine = testContent.split('\n')[0]
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`${textFirstLine}\n> []`)
        done()
      }
    })
    addComment(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`${textFirstLine}\n> []`)
        done()
      }
    })
    addComment(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('2nd line\n> []')
        done()
      }
    })
    addComment(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual('2nd line\n> []')
        done()
      }
    })
    addComment(editor)
  })
})
describe('test addTable', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  const textFirstLine = testContent.split('\n')[0]
  const table = '| # 1  | # 2  | # 3  |\n| ---- | ---- | ---- |\n| Text | Text | Text |'
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`${textFirstLine}\n${table}`)
        done()
      }
    })
    addTable(editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(`${textFirstLine}\n${table}`)
        done()
      }
    })
    addTable(editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`2nd line\n${table}`)
        done()
      }
    })
    addTable(editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(`2nd line\n${table}`)
        done()
      }
    })
    addTable(editor)
  })
})

describe('test addEmoji with native emoji', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  const textFirstLine = testContent.split('\n')[0]
  const emoji = Mock.of<EmojiData>({
    colons: ':+1:'
  })
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(':+1:')
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(':+1:')
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual(':+1:')
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual(':+1:')
        done()
      }
    })
    addEmoji(emoji, editor)
  })
})

describe('test addEmoji with native emoji', () => {
  const { cursor, firstLine, multiline, multilineOffset } = buildRanges()
  const textFirstLine = testContent.split('\n')[0]
  const forkAwesomeIcon = ':fa-star:'
  const emoji = Mock.of<EmojiData>({
    name: 'star',
    colons: ':fa-star:',
    imageUrl: '/img/forkawesome.png'
  })
  it('just cursor', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: cursor.from,
          head: cursor.to,
          from: () => cursor.from,
          to: () => cursor.to,
          empty: () => true
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[]) => {
        expect(replacement).toEqual(forkAwesomeIcon)
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('1st line', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: firstLine.from,
          head: firstLine.to,
          from: () => firstLine.from,
          to: () => firstLine.to,
          empty: () => false
        }])
      ),
      getLine: (): string => (textFirstLine),
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(firstLine.from)
        expect(to).toEqual(firstLine.to)
        expect(replacement).toEqual(forkAwesomeIcon)
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multiline.from,
          head: multiline.to,
          from: () => multiline.from,
          to: () => multiline.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multiline.from)
        expect(to).toEqual(multiline.to)
        expect(replacement).toEqual(forkAwesomeIcon)
        done()
      }
    })
    addEmoji(emoji, editor)
  })

  it('multiple lines with offset', done => {
    Mock.extend(editor).with({
      listSelections: () => (
        Mock.of<Range[]>([{
          anchor: multilineOffset.from,
          head: multilineOffset.to,
          from: () => multilineOffset.from,
          to: () => multilineOffset.to,
          empty: () => false
        }])
      ),
      getLine: (): string => '2nd line',
      replaceRange: (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position) => {
        expect(from).toEqual(multilineOffset.from)
        expect(to).toEqual(multilineOffset.to)
        expect(replacement).toEqual(forkAwesomeIcon)
        done()
      }
    })
    addEmoji(emoji, editor)
  })
})
