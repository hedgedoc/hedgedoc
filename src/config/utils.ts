/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const toArrayConfig = (configValue: string, separator = ',') => {
  if (!configValue) {
    return [];
  }

  if (!configValue.includes(separator)) {
    return [configValue.trim()];
  }

  return configValue.split(separator).map((arrayItem) => arrayItem.trim());
};

export const buildErrorMessage = (errorMessages: string[]): string => {
  let totalErrorMessage = 'There were some errors with your configuration:';
  for (const message of errorMessages) {
    totalErrorMessage += '\n - ';
    totalErrorMessage += message;
  }
  totalErrorMessage +=
    '\nFor further information, have a look at our configuration docs at https://docs.hedgedoc.org/configuration';
  return totalErrorMessage;
};

export const replaceAuthErrorsWithEnvironmentVariables = (
  message: string,
  name: string,
  replacement: string,
  arrayOfNames: string[],
): string => {
  // this builds a regex like /"gitlab\[(\d+)]\./ to extract the position in the arrayOfNames
  const regex = new RegExp('"' + name + '\\[(\\d+)]\\.', 'g');
  message = message.replace(
    regex,
    (_, index) => `"${replacement}${arrayOfNames[index]}.`,
  );
  message = message.replace('.providerName', '_PROVIDER_NAME');
  message = message.replace('.baseURL', '_BASE_URL');
  message = message.replace('.clientID', '_CLIENT_ID');
  message = message.replace('.clientSecret', '_CLIENT_SECRET');
  message = message.replace('.scope', '_SCOPE');
  message = message.replace('.version', '_GITLAB_VERSION');
  message = message.replace('.url', '_URL');
  message = message.replace('.bindDn', '_BIND_DN');
  message = message.replace('.bindCredentials', '_BIND_CREDENTIALS');
  message = message.replace('.searchBase', '_SEARCH_BASE');
  message = message.replace('.searchFilter', '_SEARCH_FILTER');
  message = message.replace('.searchAttributes', '_SEARCH_ATTRIBUTES');
  message = message.replace('.usernameField', '_USERNAME_FIELD');
  message = message.replace('.useridField', '_USERID_FIELD');
  message = message.replace('.tlsCa', '_TLS_CA');
  message = message.replace('.idpSsoUrl', '_IDPSSOURL');
  message = message.replace('.idpCert', '_IDPCERT');
  message = message.replace('.clientCert', '_CLIENTCERT');
  message = message.replace('.issuer', '_ISSUER');
  message = message.replace('.identifierFormat', '_IDENTIFIERFORMAT');
  message = message.replace(
    '.disableRequestedAuthnContext',
    '_DISABLEREQUESTEDAUTHNCONTEXT',
  );
  message = message.replace('.groupAttribute', '_GROUPATTRIBUTE');
  message = message.replace('.requiredGroups', '_REQUIREDGROUPS');
  message = message.replace('.externalGroups', '_EXTERNALGROUPS');
  message = message.replace('.attribute.id', '_ATTRIBUTE_ID');
  message = message.replace('.attribute.username', '_ATTRIBUTE_USERNAME');
  message = message.replace('.attribute.email', '_ATTRIBUTE_USERNAME');
  message = message.replace('.userProfileURL', '_USER_PROFILE_URL');
  message = message.replace('.userProfileIdAttr', '_USER_PROFILE_ID_ATTR');
  message = message.replace(
    '.userProfileUsernameAttr',
    '_USER_PROFILE_USERNAME_ATTR',
  );
  message = message.replace(
    '.userProfileDisplayNameAttr',
    '_USER_PROFILE_DISPLAY_NAME_ATTR',
  );
  message = message.replace(
    '.userProfileEmailAttr',
    '_USER_PROFILE_EMAIL_ATTR',
  );
  message = message.replace('.tokenURL', '_TOKEN_URL');
  message = message.replace('.authorizationURL', '_AUTHORIZATION_URL');
  message = message.replace('.rolesClaim', '_ROLES_CLAIM');
  message = message.replace('.accessRole', '_ACCESS_ROLE');
  return message;
};
