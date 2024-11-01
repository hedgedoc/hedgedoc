/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { convertInlineStyleToMap } from './convertInlineStyleToMap.js'

describe('convertInlineStyleToMap', () => {
  it('should split on normal ;', () => {
    const styleObject = convertInlineStyleToMap('display: flex;flex-flow: row;')
    expect(Object.keys(styleObject)).toHaveLength(2)
    expect(styleObject.display).toEqual('flex')
    expect(styleObject.flexFlow).toEqual('row')
  })
  it('should not split on a ; in string', () => {
    const styleObject = convertInlineStyleToMap(
      "background-image: url('data:image/svg+xml;base64,...');"
    )
    expect(Object.keys(styleObject)).toHaveLength(1)
    expect(styleObject.backgroundImage).toEqual(
      "url('data:image/svg+xml;base64,...')"
    )
  })
  it('should not split on an escaped ;', () => {
    const styleObject = convertInlineStyleToMap('content: \\;;')
    expect(Object.keys(styleObject)).toHaveLength(1)
    expect(styleObject.content).toEqual('\\;')
  })
})
