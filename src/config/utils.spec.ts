/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Loglevel } from './loglevel.enum';
import {
  needToLog,
  parseOptionalNumber,
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
});
