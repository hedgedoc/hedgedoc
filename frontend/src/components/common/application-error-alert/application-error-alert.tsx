/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React from 'react'
import { HedgeDocLogoHorizontalGrey } from '../hedge-doc-logo/hedge-doc-logo-horizontal-grey'
import styles from './style.module.scss'
import { Alert } from 'react-bootstrap'
import { concatCssClasses } from '../../../utils/concat-css-classes'

export interface ApplicationErrorAlertProps extends PropsWithChildren {
  className?: string
}

/**
 * Renders an alert box that indicates an error in the application.
 *
 * @param error The error message to display.
 */
export const ApplicationErrorAlert: React.FC<ApplicationErrorAlertProps> = ({ children, className }) => {
  return (
    <Alert className={concatCssClasses(styles.alert, className)}>
      <p className={'d-flex align-items-center'}>
        <HedgeDocLogoHorizontalGrey color={'dark'} showText={false} size={32} width={32} className={styles.logo} />
        <span className={concatCssClasses(styles.exclamation, 'ms-1 me-2')}>!</span>
        <span>{children}</span>
      </p>
    </Alert>
  )
}
