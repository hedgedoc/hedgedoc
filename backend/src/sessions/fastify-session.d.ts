/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@fastify/session';
import type { SessionState } from './session-state';

declare module 'fastify' {
  interface Session extends SessionState {}
}
