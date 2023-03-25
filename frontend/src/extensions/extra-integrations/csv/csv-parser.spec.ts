/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseCsv } from './csv-parser'

describe('test CSV parser', () => {
  it('normal table', () => {
    const input = 'A;B;C\nD;E;F\nG;H;I'
    const expected = [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I']
    ]
    expect(parseCsv(input, ';')).toEqual(expected)
  })

  it('blank lines', () => {
    const input = 'A;B;C\n\nG;H;I'
    const expected = [
      ['A', 'B', 'C'],
      ['G', 'H', 'I']
    ]
    expect(parseCsv(input, ';')).toEqual(expected)
  })

  it('items with delimiter', () => {
    const input = 'A;B;C\n"D;E;F"\nG;H;I'
    const expected = [['A', 'B', 'C'], ['"D;E;F"'], ['G', 'H', 'I']]
    expect(parseCsv(input, ';')).toEqual(expected)
  })
})
