/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TOptions } from 'i18next'
import type { Icon } from 'react-bootstrap-icons'

export interface UiNotificationButton {
  label: string
  onClick: () => void
}

export interface DispatchOptions {
  titleI18nOptions: TOptions
  contentI18nOptions: TOptions
  durationInSecond: number
  icon?: Icon
  buttons: UiNotificationButton[]
}

export interface UiNotification extends DispatchOptions {
  titleI18nKey: string
  contentI18nKey: string
  createdAtTimestamp: number
  dismissed: boolean
  uuid: string
}
