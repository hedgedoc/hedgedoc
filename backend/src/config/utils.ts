/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Loglevel } from './loglevel.enum';

/**
 * Finds duplicates in an array
 * This function uses the conversion of the array to a Set to find duplicates even if an item is present three or more times
 *
 * @param array The array to search for duplicates
 * @returns An array containing the duplicate items
 */
export function findDuplicatesInArray<T>(array: T[]): T[] {
  return Array.from(new Set(array.filter((item, index) => array.indexOf(item) !== index)));
}

/**
 * Ensures that no duplicates exist in the provided array of names
 * If duplicates are found, an error is thrown with a message containing the duplicate names
 *
 * @param authName The name of the authentication method
 * @param names The array of names to check for duplicates
 * @throws Error if duplicates are found in the names array
 */
export function ensureNoDuplicatesExist(authName: string, names: string[]): void {
  const duplicates = findDuplicatesInArray(names);
  if (duplicates.length !== 0) {
    throw new Error(
      `Your ${authName} names '${names.join(',')}' contain duplicates: '${duplicates.join(',')}'`,
    );
  }
}

/**
 * Converts a (comma-)separated configuration value to an array of strings or undefined if it is undefined
 *
 * @param configValue The configuration value to convert
 * @param separator The separator to use for splitting the value (default is ',')
 * @returns An array of strings or undefined if configValue is undefined
 */
export function toArrayConfig(configValue?: string, separator = ','): string[] | undefined {
  if (!configValue) {
    return undefined;
  }
  if (!configValue.includes(separator)) {
    return [configValue.trim()];
  }
  return configValue.split(separator).map((arrayItem) => arrayItem.trim());
}

/**
 * Checks if the current log level is sufficient to log a message at the requested log level
 *
 * @param currentLoglevel The current log level
 * @param requestedLoglevel The requested log level
 * @returns true if the current log level is sufficient to log the requested log level, false otherwise
 */
export function needToLog(currentLoglevel: Loglevel, requestedLoglevel: Loglevel): boolean {
  const current = transformLoglevelToInt(currentLoglevel);
  const requested = transformLoglevelToInt(requestedLoglevel);
  return current >= requested;
}

/**
 * Transforms a Loglevel value to an integer representation where a higher number means more log output
 *
 * @param loglevel The Loglevel to transform
 * @returns The integer representation of the log level
 */
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

/**
 * Parses a string to a number. If the value is undefined, it returns undefined.
 *
 * @param value The value to parse
 * @returns The parsed number or undefined if the value is undefined
 */
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
  return (
    value === '1' ||
    value.toLowerCase() === 'y' ||
    value.toLowerCase() === 'yes' ||
    value.toLowerCase() === 'true'
  );
}

/**
 * Prints the given error message to the console (STDERR usually) and then exits the HedgeDoc process.
 * This is required, since just throwing a config error does not exit the app but instead just gives the
 * error message to the exception handler. We cannot use the loggerService here, since the config
 * configures the logger as well and could be prone to errors.
 *
 * @param errorMessage The error message to show before exiting.
 */
export function printConfigErrorAndExit(errorMessage: string): never {
  console.error(errorMessage);
  return process.exit(1);
}
