/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const supportedMimeTypes: string[] = [
  'image/apng',
  'image/bmp',
  'image/gif',
  'image/heif',
  'image/heic',
  'image/heif-sequence',
  'image/heic-sequence',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp'
]

export const acceptedMimeTypes = supportedMimeTypes.join(', ')
