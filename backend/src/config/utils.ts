/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  ZodArray,
  ZodDiscriminatedUnion,
  ZodDiscriminatedUnionOption,
  ZodEffects,
  ZodIssue,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodTypeAny,
} from 'zod';

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

export function extractDescriptionFromZodSchema(
  schema:
    | ZodEffects<ZodObject<ZodRawShape>>
    | ZodObject<ZodRawShape>
    | ZodDiscriminatedUnion<string, ZodDiscriminatedUnionOption<string>[]>,
  issue: ZodIssue,
): string {
  // ZodEffects are wrapped schemas on which transformations or refinements are applied.
  // If we get a ZodEffect here, we need to extract the underlying schema object to get the description.
  const rootSchema: ZodObject<ZodRawShape> =
    schema instanceof ZodEffects
      ? schema._def.schema
      : schema instanceof ZodDiscriminatedUnion
        ? schema._def.options[0] // TODO How do we get the correct schema here?
        : schema;
  const lengthOfPath = issue.path.length;
  let field = rootSchema.shape[issue.path[0]] as
    | ZodObject<ZodRawShape>
    | ZodArray<ZodObject<ZodRawShape>>
    | ZodOptional<ZodTypeAny>;
  let description: string | undefined = undefined;
  if (lengthOfPath > 1) {
    let counter = 1;
    while (counter < lengthOfPath) {
      description = field.description;
      if (field instanceof ZodOptional) {
        field = field.unwrap() as
          | ZodObject<ZodRawShape>
          | ZodArray<ZodObject<ZodRawShape>>;
        if (field.description) {
          description = field.description;
        }
      }
      if (field instanceof ZodArray) {
        // We encountered an array
        description = `${description}[${issue.path[counter]}]`;
        //@ts-ignore
        field = field.element._def.schema;
        counter += 1;
        continue;
      }
      field = field.shape[issue.path[counter]] as ZodObject<ZodRawShape>;
      counter += 1;
    }
  }
  if (!description) {
    description = field.description ?? '(unknown field)';
  }
  return `${description}: ${issue.message}`;
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
    newMessage = newMessage.replace('.endSessionUrl', '_END_SESSION_URL');
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
