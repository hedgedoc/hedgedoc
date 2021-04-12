/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  replaceAuthErrorsWithEnvironmentVariables,
  toArrayConfig,
} from './utils';

describe('config utils', () => {
  describe('toArrayConfig', () => {
    it('empty', () => {
      expect(toArrayConfig('')).toEqual([]);
    });
    it('one element', () => {
      expect(toArrayConfig('one')).toEqual(['one']);
    });
    it('multiple elements', () => {
      expect(toArrayConfig('one, two, three')).toEqual(['one', 'two', 'three']);
    });
    it('non default seperator', () => {
      expect(toArrayConfig('one ; two ; three', ';')).toEqual([
        'one',
        'two',
        'three',
      ]);
    });
  });
  describe('toArrayConfig', () => {
    it('"gitlab[0].scope', () => {
      expect(
        replaceAuthErrorsWithEnvironmentVariables(
          '"gitlab[0].scope',
          'gitlab',
          'HD_AUTH_GITLAB_',
          ['test'],
        ),
      ).toEqual('"HD_AUTH_GITLAB_test_SCOPE');
    });
  });
});
