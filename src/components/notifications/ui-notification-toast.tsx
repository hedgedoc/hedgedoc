/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ProgressBar, Toast } from 'react-bootstrap'
import type { UiNotification } from '../../redux/ui-notifications/types'
import { ForkAwesomeIcon } from '../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../common/show-if/show-if'
import type { IconName } from '../common/fork-awesome/types'
import { Trans, useTranslation } from 'react-i18next'
import { Logger } from '../../utils/logger'
import { cypressId } from '../../utils/cypress-attribute'
import { useEffectOnce, useInterval } from 'react-use'
import { dismissUiNotification } from '../../redux/ui-notifications/methods'
import styles from './notifications.module.scss'
import { DateTime } from 'luxon'

const STEPS_PER_SECOND = 10
const log = new Logger('UiNotificationToast')

export interface UiNotificationProps extends UiNotification {
  notificationId: number
}

/**
 * Renders a single notification.
 *
 * @param titleI18nKey The i18n key for the title
 * @param contentI18nKey The i18n key for the content
 * @param titleI18nOptions The i18n options for the title
 * @param contentI18nOptions The i18n options for the content
 * @param createdAtTimestamp The timestamp, when this notification was created.
 * @param icon The optional icon to be used
 * @param dismissed If the notification is already dismissed
 * @param notificationId The notification id
 * @param durationInSecond How long the notification should be shown
 * @param buttons A list of {@link UiNotificationButton UiNotificationButtons} to be displayed
 */
export const UiNotificationToast: React.FC<UiNotificationProps> = ({
  titleI18nKey,
  contentI18nKey,
  titleI18nOptions,
  contentI18nOptions,
  createdAtTimestamp,
  icon,
  dismissed,
  notificationId,
  durationInSecond,
  buttons
}) => {
  const { t } = useTranslation()
  const [remainingSteps, setRemainingSteps] = useState<number>(() => durationInSecond * STEPS_PER_SECOND)

  const dismissNow = useCallback(() => {
    log.debug(`Dismiss notification ${notificationId} immediately`)
    setRemainingSteps(0)
  }, [notificationId])

  useEffectOnce(() => {
    log.debug(`Show notification ${notificationId}`)
  })

  const formatCreatedAtDate = useCallback(() => {
    return DateTime.fromSeconds(createdAtTimestamp).toRelative({ style: 'short' })
  }, [createdAtTimestamp])

  const [formattedCreatedAtDate, setFormattedCreatedAtDate] = useState(() => formatCreatedAtDate())

  useInterval(
    () => {
      setRemainingSteps((lastRemainingSteps) => lastRemainingSteps - 1)
      setFormattedCreatedAtDate(formatCreatedAtDate())
    },
    !dismissed && remainingSteps > 0 ? 1000 / STEPS_PER_SECOND : null
  )

  useEffect(() => {
    if (remainingSteps <= 0 && !dismissed) {
      log.debug(`Dismiss notification ${notificationId}`)
      dismissUiNotification(notificationId)
    }
  }, [dismissed, remainingSteps, notificationId])

  const buttonsDom = useMemo(
    () =>
      buttons?.map((button, buttonIndex) => {
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
    [buttons, dismissNow]
  )

  const contentDom = useMemo(() => {
    return t(contentI18nKey, contentI18nOptions)
      .split('\n')
      .map((value, lineNumber) => {
        return (
          <Fragment key={lineNumber}>
            {value}
            <br />
          </Fragment>
        )
      })
  }, [contentI18nKey, contentI18nOptions, t])

  return (
    <Toast className={styles.toast} show={!dismissed} onClose={dismissNow} {...cypressId('notification-toast')}>
      <Toast.Header>
        <strong className='mr-auto'>
          <ShowIf condition={!!icon}>
            <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true} className={'mr-1'} />
          </ShowIf>
          <Trans i18nKey={titleI18nKey} tOptions={titleI18nOptions} />
        </strong>
        <small>{formattedCreatedAtDate}</small>
      </Toast.Header>
      <Toast.Body>{contentDom}</Toast.Body>
      <ProgressBar
        variant={'info'}
        now={remainingSteps}
        max={durationInSecond * STEPS_PER_SECOND}
        min={STEPS_PER_SECOND}
        className={styles.progress}
      />
      <div>{buttonsDom}</div>
    </Toast>
  )
}
