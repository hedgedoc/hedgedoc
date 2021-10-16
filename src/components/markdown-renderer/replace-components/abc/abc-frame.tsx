/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useRef } from 'react'
import './abc.scss'
import { Logger } from '../../../../utils/logger'

const log = new Logger('AbcFrame')

export interface AbcFrameProps {
  code: string
}

export const AbcFrame: React.FC<AbcFrameProps> = ({ code }) => {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) {
      return
    }
    const actualContainer = container.current
    import(/* webpackChunkName: "abc.js" */ 'abcjs')
      .then((imp) => {
        imp.renderAbc(actualContainer, code, {})
      })
      .catch((error: Error) => {
        log.error('Error while loading abcjs', error)
      })
  }, [code])

  return <div ref={container} className={'abcjs-score bg-white text-black svg-container'} />
}
