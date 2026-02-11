/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SetMetadata } from '@nestjs/common';

export const CSRF_EXEMPT_KEY = 'csrf_exempt';

/**
 * Decorator to mark a route as exempt from CSRF protection.
 * Use this for endpoints that are called by external services (e.g., OIDC providers)
 * rather than by the user's browser.
 */
export const CsrfExempt = () => SetMetadata(CSRF_EXEMPT_KEY, true);
