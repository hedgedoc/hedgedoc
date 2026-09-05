'use strict'

const assert = require('assert')
const { JSDOM } = require('jsdom')
const jquery = require('jquery')
const markdownit = require('markdown-it')

const ELEMENT_NODE = 1

describe('Markdown renderer', function () {
  it('preserves plain text following a standalone HTML break', function () {
    const md = markdownit('default', { html: true, breaks: true })
    const $ = jquery(new JSDOM('<div id="target"></div>').window)
    const rendered = md.render('Meow1\n\n<br>\n**Meow2**\nMeow3\n\nMeow4')
    const contents = $(`<div>${rendered}</div>`).contents().filter((index, node) => node.nodeType === ELEMENT_NODE || node.textContent.trim()).toArray()

    $('#target').empty().append(contents)

    assert.strictEqual($('#target').html(), '<p>Meow1</p><br>\n**Meow2**\nMeow3\n<p>Meow4</p>')
  })
})
