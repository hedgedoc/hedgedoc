/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { useApplicationState } from '../../hooks/common/use-application-state'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the welcome message for the explore page.
 */
export const Welcome: React.FC = () => {
  useTranslation()
  const userName = useApplicationState((state) => state.user?.displayName)

  return (
    <h1 className={'my-4'}>
      {userName !== undefined ? (
        <Trans i18nKey={'explore.welcome.user'} values={{ userName }} />
      ) : (
        <Trans i18nKey={'explore.welcome.guest'} />
      )}
    </h1>
  )
}
