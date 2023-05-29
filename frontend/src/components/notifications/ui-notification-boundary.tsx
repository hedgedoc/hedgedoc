'use client'
/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../utils/logger'
import type { DispatchOptions, UiNotification } from './types'
import { UiNotifications } from './ui-notifications'
import type { TOptions } from 'i18next'
import { DateTime } from 'luxon'
import type { PropsWithChildren } from 'react'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ExclamationTriangle as IconExclamationTriangle } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'
import { v4 as uuid } from 'uuid'

const log = new Logger('Notifications')

interface UiNotificationContext {
  dispatchUiNotification: (
    titleI18nKey: string,
    contentI18nKey: string,
    dispatchOptions: Partial<DispatchOptions>
  ) => void

  showErrorNotification: (messageI18nKey: string, messageI18nOptions?: TOptions) => (error: Error) => void

  dismissNotification: (notificationUuid: string) => void
}

/**
 * Provides utility functions to manipulate the notifications in the current context.
 */
export const useUiNotifications: () => UiNotificationContext = () => {
  const communicatorFromContext = useContext(uiNotificationContext)
  if (!communicatorFromContext) {
    throw new Error('No ui notifications')
  }
  return communicatorFromContext
}

export const DEFAULT_DURATION_IN_SECONDS = 10
const uiNotificationContext = createContext<UiNotificationContext | undefined>(undefined)

/**
 * Provides a UI-notification context for the given children.
 *
 * @param children The children that receive the context
 */
export const UiNotificationBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation()
  const [uiNotifications, setUiNotifications] = useState<UiNotification[]>([])

  const dispatchUiNotification = useCallback(
    (
      titleI18nKey: string,
      contentI18nKey: string,
      { icon, durationInSecond, buttons, contentI18nOptions, titleI18nOptions }: Partial<DispatchOptions>
    ) => {
      setUiNotifications((oldState) => [
        ...oldState,
        {
          titleI18nKey,
          contentI18nKey,
          createdAtTimestamp: DateTime.now().toSeconds(),
          dismissed: false,
          titleI18nOptions: titleI18nOptions ?? {},
          contentI18nOptions: contentI18nOptions ?? {},
          durationInSecond: durationInSecond ?? DEFAULT_DURATION_IN_SECONDS,
          buttons: buttons ?? [],
          icon: icon,
          uuid: uuid()
        }
      ])
    },
    []
  )

  const showErrorNotification = useCallback(
    (messageI18nKey: string, messageI18nOptions: Record<string, unknown> = {}) =>
      (error: Error): void => {
        log.error(t(messageI18nKey, messageI18nOptions), error)
        void dispatchUiNotification('common.errorOccurred', messageI18nKey, {
          contentI18nOptions: messageI18nOptions,
          icon: IconExclamationTriangle
        })
      },
    [dispatchUiNotification, t]
  )

  const dismissNotification = useCallback((notificationUuid: string): void => {
    setUiNotifications((old) => {
      const found = old.find((notification) => notification.uuid === notificationUuid)
      if (found === undefined) {
        return old
      }
      return old.filter((value) => value.uuid !== notificationUuid).concat({ ...found, dismissed: true })
    })
  }, [])

  const context = useMemo(() => {
    return {
      dispatchUiNotification: dispatchUiNotification,
      showErrorNotification: showErrorNotification,
      dismissNotification: dismissNotification
    }
  }, [dismissNotification, dispatchUiNotification, showErrorNotification])

  return (
    <uiNotificationContext.Provider value={context}>
      <UiNotifications notifications={uiNotifications} />
      {children}
    </uiNotificationContext.Provider>
  )
}
