/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { UserAvatar } from '../../common/user-avatar/user-avatar'

/**
 * Shows the current avatar and the placeholder for changing it.
 */
export const AvatarSection: React.FC = () => {
  useTranslation()
  const user = useApplicationState((state) => state.user)

  return (
    <Fragment>
      <h3 className={'mb-2 h5'}>
        <Trans i18nKey='preferences.profile.avatar.title' />
      </h3>
      <div className='d-flex align-items-center gap-3 mb-2'>
        {user && <UserAvatar user={user} size='lg' showName={false} />}
        <Button variant='secondary' disabled={true} title={''}>
          <Trans i18nKey='preferences.profile.avatar.change' />
        </Button>
      </div>
    </Fragment>
  )
}
