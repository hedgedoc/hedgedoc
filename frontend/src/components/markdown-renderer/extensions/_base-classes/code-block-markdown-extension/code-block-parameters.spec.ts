/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseCodeBlockParameters } from './code-block-parameters'

describe('Code block parameter parsing', () => {
  it('should detect just the language', () => {
    const result = parseCodeBlockParameters('esperanto')
    expect(result.language).toBe('esperanto')
    expect(result.codeFenceParameters).toBe('')
  })
  it('should detect an empty string', () => {
    const result = parseCodeBlockParameters('')
    expect(result.language).toBe('')
    expect(result.codeFenceParameters).toBe('')
  })
  it('should detect additional information after the language', () => {
    const result = parseCodeBlockParameters('esperanto!!!!!')
    expect(result.language).toBe('esperanto')
    expect(result.codeFenceParameters).toBe('!!!!!')
  })
  it('should detect just the additional information if no language is given', () => {
    const result = parseCodeBlockParameters('!!!!!esperanto')
    expect(result.language).toBe('')
    expect(result.codeFenceParameters).toBe('!!!!!esperanto')
  })
  it('should detect additional information if separated from the language with a space', () => {
    const result = parseCodeBlockParameters('esperanto sed multe')
    expect(result.language).toBe('esperanto')
    expect(result.codeFenceParameters).toBe('sed multe')
  })
  it('should ignore spaces at the beginning and the end', () => {
    const result = parseCodeBlockParameters('      esperanto sed multe          ')
    expect(result.language).toBe('esperanto')
    expect(result.codeFenceParameters).toBe('sed multe')
  })
})
