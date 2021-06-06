/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import React, { useCallback } from 'react'
import { Alert, Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../../redux'
import { setBanner } from '../../../redux/banner/methods'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'
import { BANNER_LOCAL_STORAGE_KEY } from '../../application-loader/initializers/fetch-and-set-banner'

export const MotdBanner: React.FC = () => {
  const bannerState = useSelector((state: ApplicationState) => state.banner, equal)

  const dismissBanner = useCallback(() => {
    if (bannerState.lastModified) {
      window.localStorage.setItem(BANNER_LOCAL_STORAGE_KEY, bannerState.lastModified)
    }
    setBanner({
      text: '',
      lastModified: null
    })
  }, [bannerState])

  if (bannerState.text === undefined) {
    return null
  }

  if (!bannerState.text) {
    return <span data-cy={'no-motd-banner'} />
  }

  return (
    <Alert
      data-cy={'motd-banner'}
      variant='primary'
      dir='auto'
      className='mb-0 text-center d-flex flex-row justify-content-center'>
      <span className='flex-grow-1 align-self-center text-black'>{bannerState.text}</span>
      <Button data-cy={'motd-dismiss'} variant='outline-primary' size='sm' className='mx-2' onClick={dismissBanner}>
        <ForkAwesomeIcon icon='times' />
      </Button>
    </Alert>
  )
}
