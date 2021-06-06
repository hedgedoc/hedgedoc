/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ValueTransformer } from 'typeorm';

export class PrimaryValueTransformer implements ValueTransformer {
  from(value: boolean | null): boolean {
    if (value === null) {
      return false;
    }
    return value;
  }

  to(value: boolean): boolean | null {
    if (!value) {
      return null;
    }
    return value;
  }
}
