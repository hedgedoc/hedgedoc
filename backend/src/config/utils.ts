/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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
      )}' contain duplicates '${duplicates.join(',')}'`,
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

export function buildErrorMessage(errorMessages: string[]): string {
  let totalErrorMessage = 'There were some errors with your configuration:';
  for (const message of errorMessages) {
    totalErrorMessage += '\n - ';
    totalErrorMessage += message;
  }
  totalErrorMessage +=
    '\nFor further information, have a look at our configuration docs at https://docs.hedgedoc.org/configuration';
  return totalErrorMessage;
}

export function replaceAuthErrorsWithEnvironmentVariables(
  message: string,
  name: string,
  replacement: string,
  arrayOfNames: string[],
): string {
  // this builds a regex like /"gitlab\[(\d+)]\./ to extract the position in the arrayOfNames
  const regex = new RegExp('"' + name + '\\[(\\d+)]\\.', 'g');
  let newMessage = message.replace(
    regex,
    (_, index: number) => `"${replacement}${arrayOfNames[index]}.`,
  );
  if (newMessage != message) {
    newMessage = newMessage.replace('.providerName', '_PROVIDER_NAME');
    newMessage = newMessage.replace('.baseURL', '_BASE_URL');
    newMessage = newMessage.replace('.clientID', '_CLIENT_ID');
    newMessage = newMessage.replace('.url', '_URL');
    newMessage = newMessage.replace('.clientSecret', '_CLIENT_SECRET');
    newMessage = newMessage.replace('.bindDn', '_BIND_DN');
    newMessage = newMessage.replace('.bindCredentials', '_BIND_CREDENTIALS');
    newMessage = newMessage.replace('.searchBase', '_SEARCH_BASE');
    newMessage = newMessage.replace('.searchFilter', '_SEARCH_FILTER');
    newMessage = newMessage.replace('.searchAttributes', '_SEARCH_ATTRIBUTES');
    newMessage = newMessage.replace('.userIdField', '_USER_ID_FIELD');
    newMessage = newMessage.replace('.userNameField', '_USER_NAME_FIELD');
    newMessage = newMessage.replace('.displayNameField', '_DISPLAY_NAME_FIELD');
    newMessage = newMessage.replace('.emailField', '_EMAIL_FIELD');
    newMessage = newMessage.replace(
      '.profilePictureField',
      '_PROFILE_PICTURE_FIELD',
    );
    newMessage = newMessage.replace('.authorizeUrl', '_AUTHORIZE_URL');
    newMessage = newMessage.replace('.tokenUrl', '_TOKEN_URL');
    newMessage = newMessage.replace('.userinfoUrl', '_USERINFO_URL');
    newMessage = newMessage.replace('.scope', '_SCOPE');
    newMessage = newMessage.replace('.tlsCaCerts', '_TLS_CERT_PATHS');
    newMessage = newMessage.replace('.issuer', '_ISSUER');
    newMessage = newMessage.replace('.theme', '_THEME');
  }
  return newMessage;
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
