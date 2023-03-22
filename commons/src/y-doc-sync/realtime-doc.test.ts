/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { RealtimeDoc } from './realtime-doc.js'
import { describe, expect, it } from '@jest/globals'

describe('websocket-doc', () => {
  it('saves the initial content', () => {
    const textContent = 'textContent'
    const websocketDoc = new RealtimeDoc(textContent)

    expect(websocketDoc.getCurrentContent()).toBe(textContent)
  })
})
