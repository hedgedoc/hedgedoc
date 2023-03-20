/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { generateRandomName } from './name-randomizer';

describe('name randomizer', () => {
  it('generates random names', () => {
    const firstName = generateRandomName();
    const secondName = generateRandomName();
    expect(firstName).not.toBe('');
    expect(firstName).not.toBe(secondName);
  });
});
