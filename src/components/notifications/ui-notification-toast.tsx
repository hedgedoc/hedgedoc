/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button, ProgressBar, Toast } from 'react-bootstrap'
import { UiNotification } from '../../redux/ui-notifications/types'
import { ForkAwesomeIcon } from '../common/fork-awesome/fork-awesome-icon'
import { ShowIf } from '../common/show-if/show-if'
import { IconName } from '../common/fork-awesome/types'
import { dismissUiNotification } from '../../redux/ui-notifications/methods'
import { Trans, useTranslation } from 'react-i18next'
import { Logger } from '../../utils/logger'

const STEPS_PER_SECOND = 10
const log = new Logger('UiNotificationToast')

export interface UiNotificationProps extends UiNotification {
  notificationId: number
}

export const UiNotificationToast: React.FC<UiNotificationProps> = ({
  titleI18nKey,
  contentI18nKey,
  titleI18nOptions,
  contentI18nOptions,
  date,
  icon,
  dismissed,
  notificationId,
  durationInSecond,
  buttons
}) => {
  const { t } = useTranslation()
  const [eta, setEta] = useState<number>()
  const interval = useRef<NodeJS.Timeout | undefined>(undefined)

  const deleteInterval = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current)
    }
  }, [])

  const dismissThisNotification = useCallback(() => {
    log.debug(`Dismissed notification ${notificationId}`)
    dismissUiNotification(notificationId)
  }, [notificationId])

  useLayoutEffect(() => {
    if (dismissed || !!interval.current) {
      return
    }
    log.debug(`Show notification ${notificationId}`)
    setEta(durationInSecond * STEPS_PER_SECOND)
    interval.current = setInterval(
      () =>
        setEta((lastETA) => {
          if (lastETA === undefined) {
            return
          } else if (lastETA <= 0) {
            return 0
          } else {
            return lastETA - 1
          }
        }),
      1000 / STEPS_PER_SECOND
    )
    return () => {
      deleteInterval()
    }
  }, [deleteInterval, dismissThisNotification, dismissed, durationInSecond, notificationId])

  useEffect(() => {
    if (eta === 0) {
      dismissThisNotification()
    }
  }, [dismissThisNotification, eta])

  const buttonsDom = useMemo(
    () =>
      buttons?.map((button, buttonIndex) => {
        const buttonClick = () => {
          button.onClick()
          dismissThisNotification()
        }
        return (
          <Button key={buttonIndex} size={'sm'} onClick={buttonClick} variant={'link'}>
            {button.label}
          </Button>
        )
      }),
    [buttons, dismissThisNotification]
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
    <Toast show={!dismissed && eta !== undefined} onClose={dismissThisNotification}>
      <Toast.Header>
        <strong className='mr-auto'>
          <ShowIf condition={!!icon}>
            <ForkAwesomeIcon icon={icon as IconName} fixedWidth={true} className={'mr-1'} />
          </ShowIf>
          <Trans i18nKey={titleI18nKey} tOptions={titleI18nOptions} />
        </strong>
        <small>{date.toRelative({ style: 'short' })}</small>
      </Toast.Header>
      <Toast.Body>{contentDom}</Toast.Body>
      <ProgressBar variant={'info'} now={eta} max={durationInSecond * STEPS_PER_SECOND} min={0} />
      <div>{buttonsDom}</div>
    </Toast>
  )
}
