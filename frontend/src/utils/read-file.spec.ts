/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FileContentFormat, readFile } from './read-file'

describe('read file', () => {
  it('reads files as text', async () => {
    const a = await readFile(new Blob(['Kinderriegel'], { type: 'text/plain' }), FileContentFormat.TEXT)
    expect(a).toBe('Kinderriegel')
  })
  it('reads files as data url', async () => {
    const a = await readFile(new Blob(['Kinderriegel'], { type: 'text/plain' }), FileContentFormat.DATA_URL)
    expect(a).toBe('data:text/plain;base64,S2luZGVycmllZ2Vs')
  })
})
