/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { extractFrontmatter } from './extractor'
import type { PresentFrontmatterExtractionResult } from './types'

describe('frontmatter extraction', () => {
  describe('isPresent property', () => {
    it('is false when note does not contain three dashes at all', () => {
      const testNote = 'abcdef\nmore text'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is false when note does not start with three dashes', () => {
      const testNote = '\n---\nthis is not frontmatter'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is false when note start with less than three dashes', () => {
      const testNote = '--\nthis is not frontmatter'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is false when note starts with three dashes but contains other characters in the same line', () => {
      const testNote = '--- a\nthis is not frontmatter'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is false when note has no ending marker for frontmatter', () => {
      const testNote = '---\nthis is not frontmatter\nbecause\nthere is no\nend marker'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is false when note end marker is present but with not the same amount of dashes as start marker', () => {
      const testNote = '---\nthis is not frontmatter\n----\ncontent'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(false)
    })
    it('is true when note end marker is present with the same amount of dashes as start marker', () => {
      const testNote = '---\nthis is frontmatter\n---\ncontent'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(true)
    })
    it('is true when note end marker is present with the same amount of dashes as start marker but without content', () => {
      const testNote = '---\nthis is frontmatter\n---'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(true)
    })
    it('is true when note end marker is present with the same amount of dots as start marker', () => {
      const testNote = '---\nthis is frontmatter\n...\ncontent'
      const extraction = extractFrontmatter(testNote)
      expect(extraction.isPresent).toBe(true)
    })
  })

  describe('lineOffset property', () => {
    it('is correct for single line frontmatter without content', () => {
      const testNote = '---\nsingle line frontmatter\n...'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.lineOffset).toEqual(3)
    })
    it('is correct for single line frontmatter with content', () => {
      const testNote = '---\nsingle line frontmatter\n...\ncontent'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.lineOffset).toEqual(3)
    })
    it('is correct for multi-line frontmatter without content', () => {
      const testNote = '---\nabc\n123\ndef\n...'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.lineOffset).toEqual(5)
    })
    it('is correct for multi-line frontmatter with content', () => {
      const testNote = '---\nabc\n123\ndef\n...\ncontent'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.lineOffset).toEqual(5)
    })
  })

  describe('rawText property', () => {
    it('contains single-line frontmatter text', () => {
      const testNote = '---\nsingle-line\n...\ncontent'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.rawText).toEqual('single-line')
    })
    it('contains multi-line frontmatter text', () => {
      const testNote = '---\nmulti\nline\n...\ncontent'
      const extraction = extractFrontmatter(testNote) as PresentFrontmatterExtractionResult
      expect(extraction.rawText).toEqual('multi\nline')
    })
  })
})
