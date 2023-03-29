/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { SignInButton } from '../../landing-layout/navigation/sign-in-button'
import styles from './cover-buttons.module.scss'
import React from 'react'

export const CoverButtons: React.FC = () => {
  const userExists = useApplicationState((state) => !!state.user)

  if (userExists) {
    return null
  }

  return (
    <div className='mb-5'>
      <SignInButton className={styles['cover-button']} variant='success' size='lg' />
    </div>
  )
}
