/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum DisconnectReasonCode {
  OK = 1000,
  INTERNAL_ERROR = 4000,
  USER_NOT_PERMITTED = 4001,
  SESSION_NOT_FOUND = 4002,
}

export const DisconnectReason = {
  [DisconnectReasonCode.OK]: 'OK',
  [DisconnectReasonCode.INTERNAL_ERROR]: 'INTERNAL_ERROR',
  [DisconnectReasonCode.USER_NOT_PERMITTED]: 'USER_NOT_PERMITTED',
  [DisconnectReasonCode.SESSION_NOT_FOUND]: 'SESSION_NOT_FOUND',
} as const satisfies Record<DisconnectReasonCode, string>
