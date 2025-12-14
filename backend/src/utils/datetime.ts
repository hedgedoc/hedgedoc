/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DateTime } from 'luxon';

export function getCurrentDateTime(): DateTime {
  return DateTime.utc();
}

export function dateTimeToISOString(datetime: DateTime): string {
  const output = datetime.toISO();
  if (output === null) {
    throw new Error("Can't convert DateTime to string");
  }
  return output;
}

export function isoStringToDateTime(input: string): DateTime {
  return DateTime.fromISO(input, { zone: 'UTC' });
}

export function dateTimeToDB(input: DateTime): string {
  const output = input.toSQL({
    includeOffset: false,
    includeZone: false,
  });
  if (output === null) {
    throw new Error("Can't convert DateTime to string");
  }
  return output;
}

export function dbToDateTime(input: string): DateTime {
  return DateTime.fromSQL(input, {
    zone: 'UTC',
  });
}
