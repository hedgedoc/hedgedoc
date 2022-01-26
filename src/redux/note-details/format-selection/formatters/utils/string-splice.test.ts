/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { stringSplice } from './string-splice'

describe('string splice', () => {
  it(`won't modify a string without deletion or text to add`, () => {
    expect(stringSplice('I am your friendly test string!', 0, '')).toEqual('I am your friendly test string!')
  })

  it('can insert a string in the string', () => {
    expect(stringSplice('I am your friendly test string!', 10, 'very ')).toEqual('I am your very friendly test string!')
  })

  it('can append a string if the index is beyond the upper bounds', () => {
    expect(stringSplice('I am your friendly test string!', 100, ' And will ever be!')).toEqual(
      'I am your friendly test string! And will ever be!'
    )
  })

  it('can prepend a string if the index is beyond the lower bounds', () => {
    expect(stringSplice('I am your friendly test string!', -100, 'Here I come! ')).toEqual(
      'Here I come! I am your friendly test string!'
    )
  })

  it('can delete parts of a string', () => {
    expect(stringSplice('I am your friendly test string!', 4, '', 5)).toEqual('I am friendly test string!')
  })

  it('can delete and insert parts of a string', () => {
    expect(stringSplice('I am your friendly test string!', 10, 'great', 8)).toEqual('I am your great test string!')
  })

  it(`will ignore a negative delete length`, () => {
    expect(stringSplice('I am your friendly test string!', 100, '', -100)).toEqual('I am your friendly test string!')
  })
})
