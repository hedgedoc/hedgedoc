/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { interpretDateTimeAsIsoDateTime } from './date';

describe('interpretDateTimeAsIsoDateTime', () => {
  it('correctly interprets date-time strings as ISO date-time', () => {
    const input = '2025-01-01 00:00:00';
    const output = '2025-01-01T00:00:00.000Z';
    const result = interpretDateTimeAsIsoDateTime(input);
    expect(result).toEqual(output);
  });
});
