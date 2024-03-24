/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Renders the info message for the media browser empty state.
 */
export const MediaBrowserEmpty: React.FC = () => {
  useTranslation()

  return (
    <div className='text-center p-2'>
      <p className='text-muted'>
        <Trans i18nKey={'editor.mediaBrowser.noMediaUploads'} />
      </p>
    </div>
  )
}
