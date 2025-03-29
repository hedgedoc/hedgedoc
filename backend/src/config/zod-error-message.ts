/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZodIssue } from 'zod';

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

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
