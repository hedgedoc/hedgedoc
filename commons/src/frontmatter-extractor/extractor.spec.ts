/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractFrontmatter } from './extractor.js'
import { describe, expect, it } from '@jest/globals'

describe('frontmatter extraction', () => {
  describe('isPresent property', () => {
    it('is false when note does not contain three dashes at all', () => {
      const testNote = ['abcdef', 'more text']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is false when note does not start with three dashes', () => {
      const testNote = ['', '---', 'this is not frontmatter']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is false when note start with less than three dashes', () => {
      const testNote = ['--', 'this is not frontmatter']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is false when note starts with three dashes but contains other characters in the same line', () => {
      const testNote = ['--- a', 'this is not frontmatter']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is false when note has no ending marker for frontmatter', () => {
      const testNote = [
        '---',
        'this is not frontmatter',
        'because',
        'there is no',
        'end marker',
      ]
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is false when note end marker is present but with not the same amount of dashes as start marker', () => {
      const testNote = ['---', 'this is not frontmatter', '----', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeUndefined()
    })
    it('is true when note end marker is present with the same amount of dashes as start marker', () => {
      const testNote = ['---', 'this is frontmatter', '---', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeDefined()
    })
    it('is true when note end marker is present with the same amount of dashes as start marker but without content', () => {
      const testNote = ['---', 'this is frontmatter', '---']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeDefined()
    })
    it('is true when note end marker is present with the same amount of dots as start marker', () => {
      const testNote = ['---', 'this is frontmatter', '...', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction).toBeDefined()
    })
  })

  describe('lineOffset property', () => {
    it('is correct for single line frontmatter without content', () => {
      const testNote = ['---', 'single line frontmatter', '...']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.lineOffset).toEqual(3)
    })
    it('is correct for single line frontmatter with content', () => {
      const testNote = ['---', 'single line frontmatter', '...', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.lineOffset).toEqual(3)
    })
    it('is correct for multi-line frontmatter without content', () => {
      const testNote = ['---', 'abc', '123', 'def', '...']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.lineOffset).toEqual(5)
    })
    it('is correct for multi-line frontmatter with content', () => {
      const testNote = ['---', 'abc', '123', 'def', '...', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.lineOffset).toEqual(5)
    })
  })

  describe('rawText property', () => {
    it('contains single-line frontmatter text', () => {
      const testNote = ['---', 'single-line', '...', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.rawText).toEqual('single-line')
    })
    it('contains multi-line frontmatter text', () => {
      const testNote = ['---', 'multi', 'line', '...', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.rawText).toEqual('multi\nline')
    })
  })

  describe('is incomplete', () => {
    it('if frontmatter is closed with one dash', () => {
      const testNote = ['---', 'type: document', '-', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.incomplete).toBeTruthy()
    })
    it('if frontmatter is closed with two dash', () => {
      const testNote = ['---', 'type: document', '-', 'content']
      const extraction = extractFrontmatter(testNote)
      expect(extraction?.incomplete).toBeTruthy()
    })
  })
})
