/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { redirect } from 'next/navigation'

/**
 * Redirects to the default preferences tab.
 */
export default function PreferencesPage() {
  redirect('/preferences/appearance')
}
