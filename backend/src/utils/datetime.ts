/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * This file allows us to extract all the DateTime handling into a single place.
 *
 * It's important to know that we store all date information in the UTC timezone in the database and send all data as
 * ISO 8601 strings to the APIs.
 */
import { DateTime } from 'luxon';

/**
 * Return the current {@link DateTime} in the UTC timezone.
 *
 * @return the current {@link DateTime}
 */
export function getCurrentDateTime(): DateTime {
  return DateTime.utc();
}

/**
 * Convert a given {@link DateTime} to the ISO 8601 string representation
 *
 * @param datetime The {@link DateTime} to be used
 *
 * @return A string in ISO 8601 format
 *
 * @throws Error If the {@link DateTime} can't be converted
 */
export function dateTimeToISOString(datetime: DateTime): string {
  const output = datetime.toISO();
  if (output === null) {
    throw new Error("Can't convert DateTime to string");
  }
  return output;
}

/**
 * Convert a given ISO 8601 string to {@link DateTime}
 *
 * @param input The ISO 8601 string to be used
 *
 * @return A {@link DateTime} created from the ISO 8601 string
 */
export function isoStringToDateTime(input: string): DateTime {
  return DateTime.fromISO(input, { zone: 'UTC' });
}

/**
 * Convert a {@link DateTime} to a sql compatible string
 *
 * @param input A {@link DateTime} to be used
 *
 * @throws Error If the {@link DateTime} can't be converted
 *
 * @return A string, that can be inserted into the DB
 */
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

/**
 * Convert a database string to a {@link DateTime}
 *
 * @param input A string from the database
 *
 * @return A {@link DateTime} created from the database string
 */
export function dbToDateTime(input: string): DateTime {
  return DateTime.fromSQL(input, {
    zone: 'UTC',
  });
}
