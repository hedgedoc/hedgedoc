/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export interface MediaRedirectResponse {
  type: 'redirect';
  url: string;
}

export interface MediaFileResponse {
  type: 'file';
  contentType: string;
  fileName: string;
  buffer: Buffer;
}

export type MediaResponse = MediaRedirectResponse | MediaFileResponse;
