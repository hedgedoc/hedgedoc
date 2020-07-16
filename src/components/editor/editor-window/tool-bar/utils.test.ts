import {
  addCodeFences,
  addHeaderLevel,
  addLink,
  addMarkup,
  addQuotes,
  createList,
  removeLastNewLine,
  replaceSelection
} from './utils'

const testContent = '1st line\n2nd line\n3rd line'
const cursor = {
  startPosition: { line: 0, ch: 0 },
  endPosition: { line: 0, ch: 0 }
}
const firstLine = {
  startPosition: { line: 0, ch: 0 },
  endPosition: { line: 0, ch: 9 }
}
const multiline = {
  startPosition: { line: 1, ch: 0 },
  endPosition: { line: 2, ch: 9 }
}
const multilineOffset = {
  startPosition: { line: 1, ch: 4 },
  endPosition: { line: 2, ch: 4 }
}

describe('test removeLastNewLine', () => {
  const testSentence = 'This is a test sentence'
  const testMultiLine = 'This is a\ntest sentence over two lines'
  it('single line without \\n at the end', () => {
    expect(removeLastNewLine(testSentence)).toEqual(testSentence)
  })

  it('single line with \\n at the end', () => {
    expect(removeLastNewLine(testSentence + '\n')).toEqual(testSentence)
  })

  it('multi line without \\n at the end', () => {
    expect(removeLastNewLine(testMultiLine)).toEqual(testMultiLine)
  })

  it('multi line with \\n at the end', () => {
    expect(removeLastNewLine(testMultiLine + '\n')).toEqual(testMultiLine)
  })
})

describe('test addMarkUp', () => {
  it('just cursor', done => {
    let error = false
    addMarkup(testContent, cursor.startPosition, cursor.endPosition, () => {
      // This should never be called
      error = true
    }, '**')
    expect(error).toBeFalsy()
    done()
  })

  it('1st line', done => {
    const newContent = testContent
      .split('\n')
      .map((line, index) => {
        if (index === 0) {
          line = `**${line}**`
        }
        return line
      })
      .join('\n')
    addMarkup(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual(newContent)
      done()
    }, '**')
  })

  it('multiple lines', done => {
    const newContent = '1st line\n**2nd line\n3rd line**'
    addMarkup(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual(newContent)
      done()
    }, '**')
  })

  it('multiple lines with offset', done => {
    const newContent = '1st line\n2nd **line\n3rd **line'
    addMarkup(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual(newContent)
      done()
    }, '**')
  })
})

describe('test addHeaderLevel', () => {
  const firstHeading = '# 1st line\n2nd line\n3rd line'
  it('no heading before', done => {
    addHeaderLevel(testContent, cursor.startPosition, content => {
      expect(content).toEqual(firstHeading)
      done()
    })
  })

  it('level one heading before', done => {
    const secondHeading = '## 1st line\n2nd line\n3rd line'
    addHeaderLevel(firstHeading, cursor.startPosition, content => {
      expect(content).toEqual(secondHeading)
      done()
    })
  })

  it('1st line', done => {
    addHeaderLevel(testContent, firstLine.startPosition, content => {
      expect(content).toEqual(firstHeading)
      done()
    })
  })

  const newMultilineContent = '1st line\n# 2nd line\n3rd line'
  it('multiple lines', done => {
    addHeaderLevel(testContent, multiline.startPosition, content => {
      expect(content).toEqual(newMultilineContent)
      done()
    })
  })

  it('multiple lines with offset', done => {
    addHeaderLevel(testContent, multilineOffset.startPosition, content => {
      expect(content).toEqual(newMultilineContent)
      done()
    })
  })
})

describe('test addCodeFences', () => {
  it('just cursor', done => {
    addCodeFences(testContent, cursor.startPosition, cursor.endPosition, content => {
      expect(content).toEqual('```\n\n```' + testContent)
      done()
    })
  })

  it('1st line', done => {
    addCodeFences(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual('```\n1st line\n```\n2nd line\n3rd line')
      done()
    })
  })

  it('multiple lines', done => {
    addCodeFences(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual('1st line\n```\n2nd line\n3rd line\n```')
      done()
    })
  })

  it('multiple lines with offset', done => {
    addCodeFences(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual('1st line\n2nd ```\nline\n3rd \n```line')
      done()
    })
  })
})

describe('test addQuotes', () => {
  it('just cursor', done => {
    addQuotes(testContent, cursor.startPosition, cursor.endPosition, content => {
      expect(content).toEqual('> ' + testContent)
      done()
    })
  })

  it('1st line', done => {
    addQuotes(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual('> ' + testContent)
      done()
    })
  })

  it('multiple lines', done => {
    addQuotes(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual('1st line\n> 2nd line\n> 3rd line')
      done()
    })
  })

  it('multiple lines with offset', done => {
    addQuotes(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual('1st line\n> 2nd line\n> 3rd line')
      done()
    })
  })
})

describe('test createList', () => {
  describe('unordered list', () => {
    it('just cursor', done => {
      createList(testContent, cursor.startPosition, cursor.endPosition, content => {
        expect(content).toEqual('- ' + testContent)
        done()
      }, () => '-')
    })

    it('1st line', done => {
      createList(testContent, firstLine.startPosition, firstLine.endPosition, content => {
        expect(content).toEqual('- ' + testContent)
        done()
      }, () => '-')
    })

    it('multiple lines', done => {
      createList(testContent, multiline.startPosition, multiline.endPosition, content => {
        expect(content).toEqual('1st line\n- 2nd line\n- 3rd line')
        done()
      }, () => '-')
    })

    it('multiple lines with offset', done => {
      createList(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
        expect(content).toEqual('1st line\n- 2nd line\n- 3rd line')
        done()
      }, () => '-')
    })
  })

  describe('ordered list', () => {
    it('just cursor', done => {
      createList(testContent, cursor.startPosition, cursor.endPosition, content => {
        expect(content).toEqual('1. ' + testContent)
        done()
      }, (j) => `${j}.`)
    })

    it('1st line', done => {
      createList(testContent, firstLine.startPosition, firstLine.endPosition, content => {
        expect(content).toEqual('1. ' + testContent)
        done()
      }, (j) => `${j}.`)
    })

    it('multiple lines', done => {
      createList(testContent, multiline.startPosition, multiline.endPosition, content => {
        expect(content).toEqual('1st line\n1. 2nd line\n2. 3rd line')
        done()
      }, (j) => `${j}.`)
    })

    it('multiple lines with offset', done => {
      createList(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
        expect(content).toEqual('1st line\n1. 2nd line\n2. 3rd line')
        done()
      }, (j) => `${j}.`)
    })
  })
})

describe('test addLink', () => {
  it('just cursor', done => {
    addLink(testContent, cursor.startPosition, cursor.endPosition, content => {
      expect(content).toEqual('[](https://)' + testContent)
      done()
    })
  })

  it('1st line', done => {
    addLink(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual('[1st line](https://)\n2nd line\n3rd line')
      done()
    })
  })

  it('multiple lines', done => {
    addLink(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual('1st line\n[2nd line\n3rd line](https://)')
      done()
    })
  })

  it('multiple lines with offset', done => {
    addLink(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual('1st line\n2nd [line\n3rd ](https://)line')
      done()
    })
  })

  it('line with link', done => {
    const link = 'http://example.com'
    addLink(link, firstLine.startPosition, { line: 0, ch: link.length }, content => {
      expect(content).toEqual(`[](${link})`)
      done()
    })
  })
})

describe('test addImage', () => {
  it('just cursor', done => {
    addLink(testContent, cursor.startPosition, cursor.endPosition, content => {
      expect(content).toEqual('![](https://)' + testContent)
      done()
    }, '!')
  })

  it('1st line', done => {
    addLink(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual('![1st line](https://)\n2nd line\n3rd line')
      done()
    }, '!')
  })

  it('multiple lines', done => {
    addLink(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual('1st line\n![2nd line\n3rd line](https://)')
      done()
    }, '!')
  })

  it('multiple lines with offset', done => {
    addLink(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual('1st line\n2nd ![line\n3rd ](https://)line')
      done()
    }, '!')
  })
})

describe('test changeSelection', () => {
  it('just cursor', done => {
    replaceSelection(testContent, cursor.startPosition, cursor.endPosition, content => {
      expect(content).toEqual('----' + testContent)
      done()
    }, '----')
  })

  it('1st line', done => {
    replaceSelection(testContent, firstLine.startPosition, firstLine.endPosition, content => {
      expect(content).toEqual('----\n2nd line\n3rd line')
      done()
    }, '----')
  })

  it('multiple lines', done => {
    replaceSelection(testContent, multiline.startPosition, multiline.endPosition, content => {
      expect(content).toEqual('1st line\n----\n3rd line')
      done()
    }, '----')
  })

  it('multiple lines with offset', done => {
    replaceSelection(testContent, multilineOffset.startPosition, multilineOffset.endPosition, content => {
      expect(content).toEqual('1st line\n2nd ----line\n3rd line')
      done()
    }, '----')
  })
})
