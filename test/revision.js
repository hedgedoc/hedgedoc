'use strict'

const assert = require('assert')
const dmpWorker = require('../lib/workers/dmpWorker')

describe('Note Revision DMP Worker', function () {
  it('correctly reconstructs revision history backwards (unpatching)', function () {
    const text1 = 'Hello, this is a beautiful world!'
    const text2 = 'Hello, this is a wonderful and beautiful new world!'
    const text3 = 'Hello, this is a wonderful and beautiful new world! And it is nice.'
    const text4 = 'Hello, this is a wonderful and beautiful new world! And it is nice. Indeed.'
    const text5 = 'Hello, this is a wonderful and beautiful new world! And it is nice. Indeed. Bye!'

    const patch4 = dmpWorker.createPatch(text4, text5)
    const patch3 = dmpWorker.createPatch(text3, text4)
    const patch2 = dmpWorker.createPatch(text2, text3)
    const patch1 = dmpWorker.createPatch(text1, text2)

    const revisions = [
      { content: text5, patch: patch4 },
      { content: null, patch: patch3 },
      { content: null, patch: patch2 },
      { content: null, patch: patch1 },
      { content: null, lastContent: text1, patch: null }
    ]

    // Retrieve revision 2 (should return text4 by inverting patch4)
    const result2 = dmpWorker.getRevision(revisions, 2)
    assert.strictEqual(result2.content, text4)

    // Retrieve revision 3 (should return text3 by inverting patch4 and patch3)
    const result3 = dmpWorker.getRevision(revisions, 3)
    assert.strictEqual(result3.content, text3)
  })

  it('handles failing patch application and shifts coordinates correctly', function () {
    const text1 = 'Part 1: Hello. Part 2: World. Part 3: Bye.'
    const text2 = 'Part 1: Hello. Part 2: Wonderful World. Part 3: Bye.'
    const text3 = 'Part 1: Hello. Part 2: Wonderful World. Part 3: See ya.'
    const text4 = 'Part 1: Hello. Part 2: Wonderful World. Part 3: See ya. Extra.'
    const text5 = 'Part 1: Hello. Part 2: Wonderful World. Part 3: See ya. Extra. Final.'

    const patch4 = dmpWorker.createPatch(text4, text5)
    const patch3 = dmpWorker.createPatch(text3, text4)
    const patch2 = dmpWorker.createPatch(text2, text3)
    const patch1 = dmpWorker.createPatch(text1, text2)

    const revisions = [
      { content: text5, patch: patch4 },
      { content: null, patch: patch3 },
      { content: null, patch: patch2 },
      { content: null, patch: patch1 },
      { content: null, lastContent: text1, patch: null }
    ]

    revisions[0].content = 'Part 1: Hello. Part 2: Wonderful World. Part 3: Completely different.'

    const result = dmpWorker.getRevision(revisions, 3)
    assert.ok(result.content.includes('Completely different.'))
  })
})
