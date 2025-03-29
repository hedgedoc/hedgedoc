/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Loglevel } from './loglevel.enum';

export function findDuplicatesInArray<T>(array: T[]): T[] {
  // This uses the Array-Set conversion to remove duplicates in the finding.
  // This can happen if an entry is present three or more times
  return Array.from(
    new Set(array.filter((item, index) => array.indexOf(item) !== index)),
  );
}

export function ensureNoDuplicatesExist(
  authName: string,
  names: string[],
): void {
  const duplicates = findDuplicatesInArray(names);
  if (duplicates.length !== 0) {
    throw new Error(
      `Your ${authName} names '${names.join(
        ',',
      )}' contain duplicates: '${duplicates.join(',')}'`,
    );
  }
}
export function toArrayConfig(
  configValue?: string,
  separator = ',',
): string[] | undefined {
  if (!configValue) {
    return undefined;
  }
  if (!configValue.includes(separator)) {
    return [configValue.trim()];
  }
  return configValue.split(separator).map((arrayItem) => arrayItem.trim());
}

export function needToLog(
  currentLoglevel: Loglevel,
  requestedLoglevel: Loglevel,
): boolean {
  const current = transformLoglevelToInt(currentLoglevel);
  const requested = transformLoglevelToInt(requestedLoglevel);
  return current >= requested;
}

function transformLoglevelToInt(loglevel: Loglevel): number {
  switch (loglevel) {
    case Loglevel.TRACE:
      return 5;
    case Loglevel.DEBUG:
      return 4;
    case Loglevel.INFO:
      return 3;
    case Loglevel.WARN:
      return 2;
    case Loglevel.ERROR:
      return 1;
  }
}

export function parseOptionalNumber(value?: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Number(value);
}

/**
 * Parses a string to a boolean. The following values are considered true:
 * true, 1, y
 *
 * @param value The value to parse
 * @returns The parsed boolean or undefined if the value is undefined
 */
export function parseOptionalBoolean(value?: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value === 'true' || value === '1' || value === 'y';
}
