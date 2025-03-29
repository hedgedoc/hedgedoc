/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type DeepPartial<T> = T extends null | undefined
  ? T
  : T extends Array<infer ArrayType>
    ? Array<DeepPartial<ArrayType>> | undefined
    : T extends Record<string | number | symbol, unknown>
      ? { [P in keyof T]?: DeepPartial<T[P]> } | undefined
      : Partial<T>
