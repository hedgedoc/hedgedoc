/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface HttpExceptionObject {
  name: string;
  message: string;
}

export function buildHttpExceptionObject(
  name: string,
  message: string,
): HttpExceptionObject {
  return {
    name: name,
    message: message,
  };
}
