/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../utils/cypress-attribute'
import { Logger } from '../../utils/logger'
import { UiIcon } from '../common/icons/ui-icon'
import styles from './notifications.module.scss'
import type { UiNotification } from './types'
import { useUiNotifications } from './ui-notification-boundary'
import { DateTime } from 'luxon'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ProgressBar, Toast } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useEffectOnce, useInterval } from 'react-use'
import { useTranslatedText } from '../../hooks/common/use-translated-text'

const STEPS_PER_SECOND = 10
const log = new Logger('UiNotificationToast')

export interface UiNotificationProps {
  notification: UiNotification
}

/**
 * Renders a single notification.
 *
 * @param notification The notification to render
 */
export const UiNotificationToast: React.FC<UiNotificationProps> = ({ notification }) => {
  const { t } = useTranslation()
  const [remainingSteps, setRemainingSteps] = useState<number>(() => notification.durationInSecond * STEPS_PER_SECOND)
  const { dismissNotification, pruneNotification } = useUiNotifications()
  const textNotificationTitle = useTranslatedText(notification.titleI18nKey, notification.titleI18nOptions)

  const dismissNow = useCallback(() => {
    log.debug(`Dismiss notification ${notification.uuid} immediately`)
    setRemainingSteps(0)
  }, [notification.uuid])

  const prune = useCallback(() => {
    log.debug(`Prune notification ${notification.uuid} from state`)
    pruneNotification(notification.uuid)
  }, [pruneNotification, notification.uuid])

  useEffectOnce(() => {
    log.debug(`Show notification ${notification.uuid}`)
  })

  const formatCreatedAtDate = useCallback(() => {
    return DateTime.fromSeconds(notification.createdAtTimestamp).toRelative({ style: 'short' })
  }, [notification])

  const [formattedCreatedAtDate, setFormattedCreatedAtDate] = useState(() => formatCreatedAtDate())

  useInterval(
    () => {
      setRemainingSteps((lastRemainingSteps) => lastRemainingSteps - 1)
      setFormattedCreatedAtDate(formatCreatedAtDate())
    },
    !notification.dismissed && remainingSteps > 0 ? 1000 / STEPS_PER_SECOND : null
  )

  useEffect(() => {
    if (remainingSteps <= 0 && !notification.dismissed) {
      log.debug(`Dismiss notification ${notification.uuid}`)
      dismissNotification(notification.uuid)
    }
  }, [remainingSteps, notification.dismissed, notification.uuid, dismissNotification])

  const buttonsDom = useMemo(
    () =>
      notification.buttons?.map((button, buttonIndex) => {
        const buttonClick = () => {
          button.onClick()
          dismissNow()
        }
        return (
          <Button key={buttonIndex} size={'sm'} onClick={buttonClick} variant={'link'}>
            {button.label}
          </Button>
        )
      }),
    [dismissNow, notification.buttons]
  )

  const contentDom = useMemo(() => {
    return t(notification.contentI18nKey, notification.contentI18nOptions)
      .split('\n')
      .map((value, lineNumber) => {
        return (
          <Fragment key={lineNumber}>
            {value}
            <br />
          </Fragment>
        )
      })
  }, [notification.contentI18nKey, notification.contentI18nOptions, t])

  return (
    <Toast
      className={styles.toast}
      show={!notification.dismissed}
      onClose={dismissNow}
      onExited={prune}
      {...cypressId('notification-toast')}>
      <Toast.Header>
        <strong className='me-auto'>
          {notification.icon !== undefined && <UiIcon icon={notification.icon} className={'me-1'} />}
          {textNotificationTitle}
        </strong>
        <small>{formattedCreatedAtDate}</small>
      </Toast.Header>
      <Toast.Body>{contentDom}</Toast.Body>
      <ProgressBar
        variant={'info'}
        now={remainingSteps}
        max={notification.durationInSecond * STEPS_PER_SECOND}
        min={STEPS_PER_SECOND}
        className={styles.progress}
      />
      <div>{buttonsDom}</div>
    </Toast>
  )
}
