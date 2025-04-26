/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as useUiNotificationsModule from '../components/notifications/ui-notification-boundary'
import { vi } from 'vitest'

vi.mock('../components/notifications/ui-notification-boundary')

/**
 * Mocks the {@link useUiNotifications} hook with stub functions for tests.
 */
export const mockUiNotifications = () => {
  vi.spyOn(useUiNotificationsModule, 'useUiNotifications').mockReturnValue({
    showErrorNotification: vi.fn(),
    dismissNotification: vi.fn(),
    dispatchUiNotification: vi.fn(),
    pruneNotification: vi.fn()
  })
}
