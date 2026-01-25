/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { csrfTokenActionsCreator } from './slice'
import type { CsrfTokenInterface } from '@hedgedoc/commons'

const MAX_CSRF_TOKEN_LIFETIME = 3600000 // 1 hour in ms

/**
 * Gets the current CSRF token from Redux store or fetches a new one if none available or older than an hour
 *
 * @returns The current CSRF token
 * @throws Error if fetching the CSRF token fails
 */
export async function getCsrfToken(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('CSRF token cannot be fetched during SSR')
  }
  let currentToken = store.getState().csrfToken.token
  const lastUpdatedAt = store.getState().csrfToken.lastUpdatedAt
  if (currentToken === null || lastUpdatedAt < Date.now() - MAX_CSRF_TOKEN_LIFETIME) {
    await refreshCsrfToken()
    currentToken = store.getState().csrfToken.token
    if (currentToken === null) {
      throw new Error('Failed to fetch CSRF token')
    }
  }
  return currentToken
}

/**
 * Refreshes the CSRF token by fetching a new one and storing it in Redux.
 * Note: This function uses a direct fetch call instead of ApiRequestBuilder
 * to avoid a circular dependency (ApiRequestBuilder imports getCsrfToken).
 */
export async function refreshCsrfToken(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }
  const response = await fetch('/api/private/csrf/token', {
    method: 'GET',
    credentials: 'same-origin'
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch CSRF token: ${response.status}`)
  }
  const data = (await response.json()) as CsrfTokenInterface
  store.dispatch(csrfTokenActionsCreator.setCsrfToken(data.token))
}

/**
 * Clears the CSRF token from Redux store
 */
export function clearCsrfToken(): void {
  store.dispatch(csrfTokenActionsCreator.clearCsrfToken())
}
