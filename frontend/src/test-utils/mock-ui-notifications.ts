/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as useUiNotificationsModule from '../components/notifications/ui-notification-boundary'

jest.mock('../components/notifications/ui-notification-boundary')

/**
 * Mocks the {@link useUiNotifications} hook with stub functions for tests.
 */
export const mockUiNotifications = () => {
  jest.spyOn(useUiNotificationsModule, 'useUiNotifications').mockReturnValue({
    showErrorNotification: jest.fn(),
    dismissNotification: jest.fn(),
    dispatchUiNotification: jest.fn(),
    pruneNotification: jest.fn()
  })
}
