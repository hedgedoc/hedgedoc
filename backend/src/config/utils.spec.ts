/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Loglevel } from './loglevel.enum';
import {
  ensureNoDuplicatesExist,
  findDuplicatesInArray,
  needToLog,
  parseOptionalBoolean,
  parseOptionalNumber,
  replaceAuthErrorsWithEnvironmentVariables,
  toArrayConfig,
} from './utils';

describe('config utils', () => {
  describe('findDuplicatesInArray', () => {
    it('empty array', () => {
      expect(findDuplicatesInArray([])).toEqual([]);
    });
    it('returns empty array when input does not have any duplicates', () => {
      expect(findDuplicatesInArray(['A', 'B'])).toEqual([]);
    });
    it('returns duplicates if input contains a duplicate', () => {
      expect(findDuplicatesInArray(['A', 'B', 'A'])).toEqual(['A']);
    });
    it('returns duplicates if input contains a duplicate twice', () => {
      expect(findDuplicatesInArray(['A', 'B', 'A', 'A'])).toEqual(['A']);
    });
    it('returns duplicates if input contains multiple duplicates', () => {
      expect(findDuplicatesInArray(['A', 'B', 'A', 'B'])).toEqual(['A', 'B']);
    });
  });
  describe('ensureNoDuplicatesExist', () => {
    // eslint-disable-next-line jest/expect-expect
    it('throws no error if everything is correct', () => {
      ensureNoDuplicatesExist('Test', ['A']);
    });
    it('throws error if there is a duplicate', () => {
      expect(() => ensureNoDuplicatesExist('Test', ['A', 'A'])).toThrow(
        "Your Test names 'A,A' contain duplicates 'A'",
      );
    });
    it('throws error if there are multiple duplicates', () => {
      expect(() =>
        ensureNoDuplicatesExist('Test', ['A', 'A', 'B', 'B']),
      ).toThrow("Your Test names 'A,A,B,B' contain duplicates 'A,B'");
    });
  });
  describe('toArrayConfig', () => {
    it('empty', () => {
      expect(toArrayConfig('')).toEqual(undefined);
      expect(toArrayConfig(undefined)).toEqual(undefined);
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
    it('"ldap[0].url', () => {
      expect(
        replaceAuthErrorsWithEnvironmentVariables(
          '"ldap[0].url',
          'ldap',
          'HD_AUTH_LDAP_',
          ['test'],
        ),
      ).toEqual('"HD_AUTH_LDAP_test_URL');
    });
    it('"ldap[0].url is not changed by gitlab call', () => {
      expect(
        replaceAuthErrorsWithEnvironmentVariables(
          '"ldap[0].url',
          'gitlab',
          'HD_AUTH_GITLAB_',
          ['test'],
        ),
      ).toEqual('"ldap[0].url');
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
  describe('parseOptionalNumber', () => {
    it('returns undefined on undefined parameter', () => {
      expect(parseOptionalNumber(undefined)).toEqual(undefined);
    });
    it('correctly parses a integer string', () => {
      expect(parseOptionalNumber('42')).toEqual(42);
    });
    it('correctly parses a float string', () => {
      expect(parseOptionalNumber('3.14')).toEqual(3.14);
    });
  });
  describe('parseOptionalBoolean', () => {
    it('returns undefined on undefined parameter', () => {
      expect(parseOptionalBoolean(undefined)).toEqual(undefined);
    });
    it('correctly parses a given string', () => {
      expect(parseOptionalBoolean('true')).toEqual(true);
      expect(parseOptionalBoolean('1')).toEqual(true);
      expect(parseOptionalBoolean('y')).toEqual(true);
      expect(parseOptionalBoolean('false')).toEqual(false);
      expect(parseOptionalBoolean('0')).toEqual(false);
      expect(parseOptionalBoolean('HedgeDoc')).toEqual(false);
    });
  });
});
