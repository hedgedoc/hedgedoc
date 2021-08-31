/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import './gist-frame.scss'
import { useResizeGistFrame } from './use-resize-gist-frame'

export interface GistFrameProps {
  id: string
}

/**
 * This component renders a GitHub Gist by placing the gist URL in an {@link HTMLIFrameElement iframe}.
 *
 * @param id The id of the gist
 */
export const GistFrame: React.FC<GistFrameProps> = ({ id }) => {
  const [frameHeight, onStartResizing] = useResizeGistFrame(150)

  const onStart = useCallback(
    (event) => {
      onStartResizing(event)
    },
    [onStartResizing]
  )

  return (
    <span>
      <iframe
        sandbox=''
        data-cy={'gh-gist'}
        width='100%'
        height={`${frameHeight}px`}
        frameBorder='0'
        title={`gist ${id}`}
        src={`https://gist.github.com/${id}.pibb`}
      />
      <span className={'gist-resizer-row'}>
        <span className={'gist-resizer'} onMouseDown={onStart} onTouchStart={onStart} />
      </span>
    </span>
  )
}
