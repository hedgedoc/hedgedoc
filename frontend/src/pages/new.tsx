/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NextPage } from 'next'
import { useSingleStringUrlParameter } from '../hooks/common/use-single-string-url-parameter'
import { useAsync } from 'react-use'
import { createNote } from '../api/notes'
import { AsyncLoadingBoundary } from '../components/common/async-loading-boundary'
import { Redirect } from '../components/common/redirect'
import { CommonErrorPage } from '../components/error-pages/common-error-page'

/**
 * Creates a new note, optionally including the passed content and redirects to that note.
 */
export const NewNotePage: NextPage = () => {
  const newContent = useSingleStringUrlParameter('content', '')

  const { loading, error, value } = useAsync(() => {
    return createNote(newContent)
  }, [newContent])

  return (
    <AsyncLoadingBoundary
      loading={loading}
      componentName={'NewNotePage'}
      error={error}
      errorComponent={
        <CommonErrorPage
          titleI18nKey={'errors.noteCreationFailed.title'}
          descriptionI18nKey={'errors.noteCreationFailed.description'}
        />
      }>
      {value ? <Redirect to={`/n/${value.metadata.primaryAddress}`} /> : null}
    </AsyncLoadingBoundary>
  )
}

export default NewNotePage
