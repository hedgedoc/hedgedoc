/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeDoc } from './realtime-doc.js'
import { describe, expect, it } from '@jest/globals'

describe('realtime doc', () => {
  it('saves an initial text content correctly', () => {
    const textContent = 'textContent'
    const realtimeDoc = new RealtimeDoc(textContent)
    expect(realtimeDoc.getCurrentContent()).toBe(textContent)
  })

  it('will initialize an empty text if no initial content is given', () => {
    const realtimeDoc = new RealtimeDoc()
    expect(realtimeDoc.getCurrentContent()).toBe('')
  })

  it('restores a yjs state vector update correctly', () => {
    const realtimeDoc = new RealtimeDoc(
      'notTheVectorText',
      [
        1, 1, 221, 208, 165, 230, 3, 0, 4, 1, 15, 109, 97, 114, 107, 100, 111,
        119, 110, 67, 111, 110, 116, 101, 110, 116, 32, 116, 101, 120, 116, 67,
        111, 110, 116, 101, 110, 116, 70, 114, 111, 109, 83, 116, 97, 116, 101,
        86, 101, 99, 116, 111, 114, 85, 112, 100, 97, 116, 101, 0,
      ],
    )

    expect(realtimeDoc.getCurrentContent()).toBe(
      'textContentFromStateVectorUpdate',
    )
  })
})
