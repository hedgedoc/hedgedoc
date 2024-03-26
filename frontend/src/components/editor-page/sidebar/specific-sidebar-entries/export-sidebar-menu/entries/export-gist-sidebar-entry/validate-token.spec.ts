import { validateToken } from './validate-token'

/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('GitHub validateToken', () => {
  it('should return true for a valid classic token', () => {
    // token is randomly generated and not real
    const token = 'ghp_yQbWDPxQgaZAeTSuVFJrmVGloUfENbFqzLHS'
    expect(validateToken(token)).toBe(true)
  })
  it('should return true for a valid scoped token', () => {
    // token is randomly generated and not real
    const token = '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'
    expect(validateToken(token)).toBe(true)
  })
  it('should return false for an empty token', () => {
    const token = ''
    expect(validateToken(token)).toBe(false)
  })
  it('should return false for an invalid classic token', () => {
    const token = 'ghp_wrong_length'
    expect(validateToken(token)).toBe(false)
  })
  it('should return false for an invalid scoped token (1)', () => {
    const token = 'github_pat_wrong_length'
    expect(validateToken(token)).toBe(false)
  })
  it('should return false for an invalid scoped token (2)', () => {
    const token = 'github_pat_wrongwronmgwrongwrongwrongwrongwrongwrongwrongwrongwrongwrongwrongwrongwrongwrongw'
    expect(validateToken(token)).toBe(false)
  })
  it('should return false for a token with an invalid prefix', () => {
    const token = 'wrong_abc'
    expect(validateToken(token)).toBe(false)
  })
})
