/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LineContentToLineIdMapper } from './line-content-to-line-id-mapper'

describe('line id mapper', () => {
  let lineIdMapper: LineContentToLineIdMapper

  beforeEach(() => {
    lineIdMapper = new LineContentToLineIdMapper()
  })

  it('should be case sensitive', () => {
    lineIdMapper.updateLineMapping(['this', 'is', 'text'])
    expect(lineIdMapper.updateLineMapping(['this', 'is', 'Text'])).toEqual([
      {
        line: 'this',
        id: 1
      },
      {
        line: 'is',
        id: 2
      },
      {
        line: 'Text',
        id: 4
      }
    ])
  })

  it('should not update line ids of shifted lines', () => {
    lineIdMapper.updateLineMapping(['this', 'is', 'text'])
    expect(lineIdMapper.updateLineMapping(['this', 'is', 'more', 'text'])).toEqual([
      {
        line: 'this',
        id: 1
      },
      {
        line: 'is',
        id: 2
      },
      {
        line: 'more',
        id: 4
      },
      {
        line: 'text',
        id: 3
      }
    ])
  })

  it('should not update line ids if nothing changes', () => {
    lineIdMapper.updateLineMapping(['this', 'is', 'text'])
    expect(lineIdMapper.updateLineMapping(['this', 'is', 'text'])).toEqual([
      {
        line: 'this',
        id: 1
      },
      {
        line: 'is',
        id: 2
      },
      {
        line: 'text',
        id: 3
      }
    ])
  })

  it('should not reuse line ids of removed lines', () => {
    lineIdMapper.updateLineMapping(['this', 'is', 'old'])
    lineIdMapper.updateLineMapping(['this', 'is'])
    expect(lineIdMapper.updateLineMapping(['this', 'is', 'new'])).toEqual([
      {
        line: 'this',
        id: 1
      },
      {
        line: 'is',
        id: 2
      },
      {
        line: 'new',
        id: 4
      }
    ])
  })

  it('should update line ids for changed lines', () => {
    lineIdMapper.updateLineMapping(['this', 'is', 'old'])
    expect(lineIdMapper.updateLineMapping(['this', 'is', 'new'])).toEqual([
      {
        line: 'this',
        id: 1
      },
      {
        line: 'is',
        id: 2
      },
      {
        line: 'new',
        id: 4
      }
    ])
  })
})
