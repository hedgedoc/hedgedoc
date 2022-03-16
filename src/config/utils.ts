/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Loglevel } from './loglevel.enum';

export function toArrayConfig(configValue?: string, separator = ','): string[] {
  if (!configValue) {
    return [];
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
    newMessage = newMessage.replace('.clientSecret', '_CLIENT_SECRET');
    newMessage = newMessage.replace('.scope', '_SCOPE');
    newMessage = newMessage.replace('.version', '_GITLAB_VERSION');
    newMessage = newMessage.replace('.url', '_URL');
    newMessage = newMessage.replace('.bindDn', '_BIND_DN');
    newMessage = newMessage.replace('.bindCredentials', '_BIND_CREDENTIALS');
    newMessage = newMessage.replace('.searchBase', '_SEARCH_BASE');
    newMessage = newMessage.replace('.searchFilter', '_SEARCH_FILTER');
    newMessage = newMessage.replace('.searchAttributes', '_SEARCH_ATTRIBUTES');
    newMessage = newMessage.replace('.usernameField', '_USERNAME_FIELD');
    newMessage = newMessage.replace('.useridField', '_USERID_FIELD');
    newMessage = newMessage.replace('.tlsCa', '_TLS_CA');
    newMessage = newMessage.replace('.idpSsoUrl', '_IDP_SSO_URL');
    newMessage = newMessage.replace('.idpCert', '_IDP_CERT');
    newMessage = newMessage.replace('.clientCert', '_CLIENT_CERT');
    newMessage = newMessage.replace('.issuer', '_ISSUER');
    newMessage = newMessage.replace('.identifierFormat', '_IDENTIFIER_FORMAT');
    newMessage = newMessage.replace(
      '.disableRequestedAuthnContext',
      '_DISABLE_REQUESTED_AUTHN_CONTEXT',
    );
    newMessage = newMessage.replace('.groupAttribute', '_GROUP_ATTRIBUTE');
    newMessage = newMessage.replace('.requiredGroups', '_REQUIRED_GROUPS');
    newMessage = newMessage.replace('.externalGroups', '_EXTERNAL_GROUPS');
    newMessage = newMessage.replace('.attribute.id', '_ATTRIBUTE_ID');
    newMessage = newMessage.replace(
      '.attribute.username',
      '_ATTRIBUTE_USERNAME',
    );
    newMessage = newMessage.replace('.attribute.email', '_ATTRIBUTE_USERNAME');
    newMessage = newMessage.replace('.userProfileURL', '_USER_PROFILE_URL');
    newMessage = newMessage.replace(
      '.userProfileIdAttr',
      '_USER_PROFILE_ID_ATTR',
    );
    newMessage = newMessage.replace(
      '.userProfileUsernameAttr',
      '_USER_PROFILE_USERNAME_ATTR',
    );
    newMessage = newMessage.replace(
      '.userProfileDisplayNameAttr',
      '_USER_PROFILE_DISPLAY_NAME_ATTR',
    );
    newMessage = newMessage.replace(
      '.userProfileEmailAttr',
      '_USER_PROFILE_EMAIL_ATTR',
    );
    newMessage = newMessage.replace('.tokenURL', '_TOKEN_URL');
    newMessage = newMessage.replace('.authorizationURL', '_AUTHORIZATION_URL');
    newMessage = newMessage.replace('.rolesClaim', '_ROLES_CLAIM');
    newMessage = newMessage.replace('.accessRole', '_ACCESS_ROLE');
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
