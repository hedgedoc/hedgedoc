/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SetMetadata } from '@nestjs/common';

export const CSRF_EXEMPT_KEY = 'csrf_exempt';

/**
 * Decorator to mark a route as exempt from CSRF protection.
 * Routes with this decorator won't be protected by CSRF protection. This is required for non-public-API endpoints
 * called from non-browsers, e.g. OIDC backchannel-logout.
 */
export const CsrfExempt = () => SetMetadata(CSRF_EXEMPT_KEY, true);
