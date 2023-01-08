/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConsoleLoggerService } from './console-logger.service';

describe('sanitize', () => {
  it('removes non-printable ASCII character', () => {
    for (let i = 0; i < 32; i++) {
      const nonPrintableString = String.fromCharCode(i);
      expect(ConsoleLoggerService.sanitize(`a${nonPrintableString}b`)).toEqual(
        'ab',
      );
    }
  });
  it('replaces non-zero-width space with space', () => {
    const nonZeroWidthSpaces = [
      '\u0020', // space
      '\u00A0', // non-breaking space
      '\u2000', // en quad
      '\u2001', // en quad
      '\u2002', // en space
      '\u2003', // en space
      '\u2004', // three-per-em space
      '\u2005', // four-per-em space
      '\u2006', // six-per-em space
      '\u2007', // figure space
      '\u2008', // punctuation space
      '\u2009', // thin space
      '\u200a', // hair space
      '\u202F', // narrow no-break space
      '\u205F', // medium mathematical space
      '\u3000', // ideographic space
    ];
    nonZeroWidthSpaces.forEach((space) => {
      expect(ConsoleLoggerService.sanitize(`c${space}d`)).toEqual('c d');
    });
  });
});
