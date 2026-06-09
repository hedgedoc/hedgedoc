'use strict'

const assert = require('assert')

const models = require('../lib/models')
const Note = models.Note

describe('Note.extractMeta', function () {
  it('parses standard frontmatter with title and description', function () {
    const content = '---\ntitle: My Note\ndescription: A test note\n---\n# Hello World'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.title, 'My Note')
    assert.strictEqual(result.meta.description, 'A test note')
    assert.strictEqual(result.markdown, '\n# Hello World')
  })

  it('parses frontmatter with tags as array', function () {
    const content = '---\ntitle: Tagged\ntags:\n  - foo\n  - bar\n  - baz\n---\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.title, 'Tagged')
    assert.deepStrictEqual(result.meta.tags, ['foo', 'bar', 'baz'])
  })

  it('parses frontmatter with tags as string', function () {
    const content = '---\ntags: foo, bar, baz\n---\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.tags, 'foo, bar, baz')
  })

  it('parses frontmatter with opengraph object', function () {
    const content = '---\nopengraph:\n  title: OG Title\n  description: OG Description\n  image: https://example.com/img.png\n---\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.opengraph.title, 'OG Title')
    assert.strictEqual(result.meta.opengraph.description, 'OG Description')
    assert.strictEqual(result.meta.opengraph.image, 'https://example.com/img.png')
  })

  it('parses frontmatter with slideOptions', function () {
    const content = '---\nslideOptions:\n  theme: moon\n  transition: slide\n---\n# Slide 1'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.slideOptions.theme, 'moon')
    assert.strictEqual(result.meta.slideOptions.transition, 'slide')
  })

  it('parses frontmatter with boolean and numeric values', function () {
    const content = '---\nbreaks: false\nGA: UA-12345\nlang: en\n---\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.breaks, false)
    assert.strictEqual(result.meta.GA, 'UA-12345')
    assert.strictEqual(result.meta.lang, 'en')
  })

  it('returns empty meta and full content when no frontmatter present', function () {
    const content = '# Just a heading\n\nSome text here.'
    const result = Note.extractMeta(content)
    assert.deepStrictEqual(result.meta, {})
    assert.strictEqual(result.markdown, content)
  })

  it('returns empty meta for empty frontmatter', function () {
    const content = '---\n---\nBody text'
    const result = Note.extractMeta(content)
    assert.deepStrictEqual(result.meta, {})
    assert.strictEqual(result.markdown, '\nBody text')
  })

  it('handles frontmatter closed with ...', function () {
    const content = '---\ntitle: Dot Delimiter\n...\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.title, 'Dot Delimiter')
    assert.strictEqual(result.markdown, '\nBody')
  })

  it('returns empty meta for malformed YAML', function () {
    const content = '---\ntitle: [invalid yaml\n---\nBody'
    const result = Note.extractMeta(content)
    assert.deepStrictEqual(result.meta, {})
    assert.strictEqual(result.markdown, content)
  })

  it('handles empty content', function () {
    const result = Note.extractMeta('')
    assert.deepStrictEqual(result.meta, {})
    assert.strictEqual(result.markdown, '')
  })

  it('handles content that starts with --- but has no closing delimiter', function () {
    const content = '---\ntitle: No closing\nNo delimiter here'
    const result = Note.extractMeta(content)
    assert.deepStrictEqual(result.meta, {})
    assert.strictEqual(result.markdown, content)
  })

  it('neutralizes YAML alias bomb (10 levels of 10-way branching)', function () {
    const content = [
      '---',
      'a0: &a0 1',
      'a1: &a1 [*a0,*a0,*a0,*a0,*a0,*a0,*a0,*a0,*a0,*a0]',
      'a2: &a2 [*a1,*a1,*a1,*a1,*a1,*a1,*a1,*a1,*a1,*a1]',
      'a3: &a3 [*a2,*a2,*a2,*a2,*a2,*a2,*a2,*a2,*a2,*a2]',
      'a4: &a4 [*a3,*a3,*a3,*a3,*a3,*a3,*a3,*a3,*a3,*a3]',
      'a5: &a5 [*a4,*a4,*a4,*a4,*a4,*a4,*a4,*a4,*a4,*a4]',
      'a6: &a6 [*a5,*a5,*a5,*a5,*a5,*a5,*a5,*a5,*a5,*a5]',
      'a7: &a7 [*a6,*a6,*a6,*a6,*a6,*a6,*a6,*a6,*a6,*a6]',
      'a8: &a8 [*a7,*a7,*a7,*a7,*a7,*a7,*a7,*a7,*a7,*a7]',
      'a9: &a9 [*a8,*a8,*a8,*a8,*a8,*a8,*a8,*a8,*a8,*a8]',
      'a10: &a10 [*a9,*a9,*a9,*a9,*a9,*a9,*a9,*a9,*a9,*a9]',
      'opengraph: *a10',
      '---',
      'x'
    ].join('\n')

    const start = Date.now()
    const result = Note.extractMeta(content)
    const elapsed = Date.now() - start

    assert.ok(elapsed < 1000, `extractMeta took ${elapsed}ms, should complete in under 1000ms`)
    assert.ok(result.meta !== null, 'meta should not be null')
    assert.ok(typeof result.meta === 'object', 'meta should be an object')
    assert.strictEqual(result.markdown, '\nx')

    const json = JSON.stringify(result.meta)
    assert.ok(json.length < 100000, `stringified meta should be small, got ${json.length} bytes`)
  })

  it('truncates excessively long string values', function () {
    const longString = 'a'.repeat(20000)
    const content = `---\ntitle: ${longString}\n---\nBody`
    const result = Note.extractMeta(content)
    assert.ok(result.meta.title.length <= 10000, `title should be truncated, got ${result.meta.title.length}`)
  })

  it('preserves normal nested objects within depth limit', function () {
    const content = '---\nlevel1:\n  level2:\n    level3: deep value\n---\nBody'
    const result = Note.extractMeta(content)
    assert.strictEqual(result.meta.level1.level2.level3, 'deep value')
  })
})
