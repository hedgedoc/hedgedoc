import { NoteUtils } from './note.utils';

describe('NoteUtils', () => {
  describe('title', () => {
    test('title from metadata', () => {
      const content = '---\ntitle: test title\n---'
      expect(NoteUtils.parseTitle(content)).toEqual('test title')
    })

    test('title from opengraph', () => {
      const content = '---\nopengraph:\n title: test title\n---'
      expect(NoteUtils.parseTitle(content)).toEqual('test title')
    })

    test('title from content', () => {
      const content = 'a bit of text\n# first\n## second\n#third'
      expect(NoteUtils.parseTitle(content)).toEqual('first')
    })

    test('title empty', () => {
      const content = 'Lorem ipsum dolor sit amet,\nconsetetur sadipscing elitr,\nsed diam'
      expect(NoteUtils.parseTitle(content)).toEqual('')
    })
  })
  describe('description', () => {
    test('description from metadata', () => {
      const content = '---\ndescription: Lorem ipsum dolor sit amet\n---'
      expect(NoteUtils.parseDescription(content)).toEqual('Lorem ipsum dolor sit amet')
    })

    test('description from opengraph', () => {
      const content = '---\nopengraph:\n description: Lorem ipsum dolor sit amet\n---'
      expect(NoteUtils.parseDescription(content)).toEqual('Lorem ipsum dolor sit amet')
    })

    test('description empty', () => {
      const content = 'Lorem ipsum dolor sit amet,\nconsetetur sadipscing elitr,\nsed diam'
      expect(NoteUtils.parseDescription(content)).toEqual('')
    })
  })
  describe('tags', () => {
    test('tags from metadata', () => {
      const content = '---\ntags: a, b, c\n---'
      expect(NoteUtils.parseTags(content)).toEqual(['a', 'b', 'c'])
    })

    test('empty tags', () => {
      const content = '---\ntags: \n---'
      expect(NoteUtils.parseTags(content)).toEqual([])
    })
  })
})
