/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useRef } from 'react'
import styles from './abc.module.scss'
import { Logger } from '../../../../utils/logger'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'
import { cypressId } from '../../../../utils/cypress-attribute'

const log = new Logger('AbcFrame')

export const AbcFrame: React.FC<CodeProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) {
      return
    }
    const actualContainer = container.current
    import(/* webpackChunkName: "abc.js" */ 'abcjs')
      .then((importedLibrary) => {
        importedLibrary.renderAbc(actualContainer, code, {})
      })
      .catch((error: Error) => {
        log.error('Error while loading abcjs', error)
      })
  }, [code])

  return (
    <div
      ref={container}
      className={`${styles['abcjs-score']} bg-white text-black svg-container`}
      {...cypressId('abcjs')}
    />
  )
}
