/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { LineIdMapper } from './line-id-mapper'

describe('line id mapper', () => {
  let lineIdMapper: LineIdMapper

  beforeEach(() => {
    lineIdMapper = new LineIdMapper()
  })

  it('should be case sensitive', () => {
    lineIdMapper.updateLineMapping('this\nis\ntext')
    expect(lineIdMapper.updateLineMapping('this\nis\nText')).toEqual([
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
    lineIdMapper.updateLineMapping('this\nis\ntext')
    expect(lineIdMapper.updateLineMapping('this\nis\nmore\ntext')).toEqual([
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
    lineIdMapper.updateLineMapping('this\nis\ntext')
    expect(lineIdMapper.updateLineMapping('this\nis\ntext')).toEqual([
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
    lineIdMapper.updateLineMapping('this\nis\nold')
    lineIdMapper.updateLineMapping('this\nis')
    expect(lineIdMapper.updateLineMapping('this\nis\nnew')).toEqual([
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
    lineIdMapper.updateLineMapping('this\nis\nold')
    expect(lineIdMapper.updateLineMapping('this\nis\nnew')).toEqual([
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
