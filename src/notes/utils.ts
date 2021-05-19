/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import base32Encode from 'base32-encode';
import { randomBytes } from 'crypto';

/**
 * Generate publicId for a note.
 * This is a randomly generated 128-bit value encoded with base32-encode using the crockford variant and converted to lowercase.
 */
export function generatePublicId(): string {
  const randomId = randomBytes(128);
  return base32Encode(randomId, 'Crockford').toLowerCase();
}
