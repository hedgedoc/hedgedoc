/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { Fragment } from 'react'
import { useLoadNoteFromServer } from './hooks/use-load-note-from-server'
import { LoadingScreen } from '../../application-loader/loading-screen/loading-screen'
import { CommonErrorPage } from '../../error-pages/common-error-page'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import { ShowIf } from '../show-if/show-if'

/**
 * Loads the note identified by the note-id in the URL.
 * During the loading a {@link LoadingScreen loading screen} will be rendered instead of the child elements.
 * The boundary also shows errors that occur during the loading process.
 *
 * @param children The react elements that will be shown when the loading was successful.
 */
export const NoteLoadingBoundary: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { error, loading } = useLoadNoteFromServer()

  if (loading) {
    return <LoadingScreen />
  } else if (error) {
    return (
      <CommonErrorPage titleI18nKey={`${error.message}.title`} descriptionI18nKey={`${error.message}.description`}>
        <ShowIf condition={error.message === 'api.note.notFound'}>
          <CreateNonExistingNoteHint />
        </ShowIf>
      </CommonErrorPage>
    )
  } else {
    return <Fragment>{children}</Fragment>
  }
}
