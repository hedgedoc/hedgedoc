/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExtendedDoc } from './extended-doc';

describe('websocket-doc', () => {
  it('saves the initial content', () => {
    const textContent = 'textContent';
    const websocketDoc = new ExtendedDoc(textContent);

    expect(websocketDoc.getCurrentContent()).toBe(textContent);
  });
});
