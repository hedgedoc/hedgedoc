/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  needToLog,
  replaceAuthErrorsWithEnvironmentVariables,
  toArrayConfig,
} from './utils';
import { Loglevel } from './loglevel.enum';

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
  describe('replaceAuthErrorsWithEnvironmentVariables', () => {
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
  describe('needToLog', () => {
    it('currentLevel ERROR', () => {
      const currentLevel = Loglevel.ERROR;
      expect(needToLog(currentLevel, Loglevel.ERROR)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.WARN)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.INFO)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.DEBUG)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.TRACE)).toBeFalsy();
    });
    it('currentLevel WARN', () => {
      const currentLevel = Loglevel.WARN;
      expect(needToLog(currentLevel, Loglevel.ERROR)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.WARN)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.INFO)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.DEBUG)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.TRACE)).toBeFalsy();
    });
    it('currentLevel INFO', () => {
      const currentLevel = Loglevel.INFO;
      expect(needToLog(currentLevel, Loglevel.ERROR)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.WARN)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.INFO)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.DEBUG)).toBeFalsy();
      expect(needToLog(currentLevel, Loglevel.TRACE)).toBeFalsy();
    });
    it('currentLevel DEBUG', () => {
      const currentLevel = Loglevel.DEBUG;
      expect(needToLog(currentLevel, Loglevel.ERROR)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.WARN)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.INFO)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.DEBUG)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.TRACE)).toBeFalsy();
    });
    it('currentLevel TRACE', () => {
      const currentLevel = Loglevel.TRACE;
      expect(needToLog(currentLevel, Loglevel.ERROR)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.WARN)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.INFO)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.DEBUG)).toBeTruthy();
      expect(needToLog(currentLevel, Loglevel.TRACE)).toBeTruthy();
    });
  });
});
