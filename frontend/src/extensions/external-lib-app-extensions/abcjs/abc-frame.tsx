/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AsyncLoadingBoundary } from '../../../components/common/async-loading-boundary/async-loading-boundary'
import { ShowIf } from '../../../components/common/show-if/show-if'
import { WaitSpinner } from '../../../components/common/wait-spinner/wait-spinner'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { useEffectWithCatch } from '../../../hooks/common/use-effect-with-catch'
import { cypressId } from '../../../utils/cypress-attribute'
import { Logger } from '../../../utils/logger'
import styles from './abc.module.scss'
import React, { useRef } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { useAsync } from 'react-use'

const log = new Logger('AbcFrame')

/**
 * Renders an abc.js note sheet.
 *
 * @param code The code to render.
 * @see https://www.abcjs.net/
 */
export const AbcFrame: React.FC<CodeProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)

  const {
    error: loadingError,
    loading,
    value: abcLib
  } = useAsync(async () => {
    try {
      return import(/* webpackChunkName: "abc.js" */ 'abcjs')
    } catch (error) {
      log.error('Error while loading abcjs', error)
      throw error
    }
  }, [])

  const renderError = useEffectWithCatch(() => {
    const actualContainer = container.current
    if (!actualContainer || !abcLib) {
      return
    }
    abcLib.renderAbc(actualContainer, code, {})
  }, [code, abcLib])

  return (
    <AsyncLoadingBoundary loading={loading || !abcLib} error={!!loadingError} componentName={'abc.js'}>
      <ShowIf condition={!!renderError}>
        <Alert variant={'danger'}>
          <Trans i18nKey={'editor.embeddings.abcJs.errorWhileRendering'} />
        </Alert>
      </ShowIf>
      <div
        ref={container}
        className={`${styles['abcjs-score']} bg-white text-black svg-container`}
        {...cypressId('abcjs')}>
        <WaitSpinner />
      </div>
    </AsyncLoadingBoundary>
  )
}
