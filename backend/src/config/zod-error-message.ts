/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZodIssue } from 'zod';

/**
 * Converts a camelCase string to snake_case.
 *
 * @param str The camelCase string to convert.
 * @returns The converted snake_case string.
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Extracts a descriptive error message from a Zod issue by traversing its path to rebuild the identifier
 * This is required because Zod does not provide a way to extract the identifier from the issue directly
 *
 * @param issue The Zod issue to extract the description from.
 * @param prefix A prefix to prepend to the identifier.
 * @param allArrays An optional record mapping array names to their string representations
 * @returns A formatted error message string
 */
export function extractDescriptionFromZodIssue(
  issue: ZodIssue,
  prefix: string,
  allArrays?: Record<string, string[]>,
): string {
  let identifier: string = prefix;
  for (let index = 0; index < issue.path.length; index++) {
    const pathSegment = issue.path[index];
    if (typeof pathSegment === 'string') {
      identifier += '_' + camelToSnakeCase(pathSegment).toUpperCase();
    } else if (index >= 1) {
      const previousPathSegment = issue.path[index - 1] as string;
      if (allArrays && allArrays[previousPathSegment]) {
        identifier += '_' + allArrays[previousPathSegment][pathSegment];
      } else {
        identifier += `[${pathSegment}]`;
      }
    }
  }
  return `${identifier}: ${issue.message}`;
}

/**
 * Builds a formatted error message from an array of zod error messages
 *
 * @param errorMessages An array of error messages to include in the formatted message
 * @returns A string containing the formatted error message
 */
export function buildErrorMessage(errorMessages: string[]): string {
  let totalErrorMessage = 'There were some errors with your configuration:';
  for (const message of errorMessages) {
    totalErrorMessage += '\n - ';
    totalErrorMessage += message;
  }
  totalErrorMessage +=
    '\nFor further information, have a look at our configuration docs at https://docs.hedgedoc.org/configuration\n';
  return totalErrorMessage;
}
