/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ClickShield } from '../../../components/markdown-renderer/replace-components/click-shield/click-shield'
import type { IdProps } from '../../../components/markdown-renderer/replace-components/custom-tag-with-id-component-replacer'
import { cypressId } from '../../../utils/cypress-attribute'
import styles from './gist-frame.module.scss'
import { useResizeGistFrame } from './use-resize-gist-frame'
import React, { useCallback } from 'react'
import { Github as IconGithub } from 'react-bootstrap-icons'

/**
 * This component renders a GitHub Gist by placing the gist URL in an {@link HTMLIFrameElement iframe}.
 *
 * @param id The id of the gist
 */
export const GistFrame: React.FC<IdProps> = ({ id }) => {
  const [frameHeight, onStartResizing] = useResizeGistFrame(150)

  const onStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      onStartResizing(event)
    },
    [onStartResizing]
  )

  return (
    <ClickShield
      fallbackBackgroundColor={'#161b22'}
      hoverIcon={IconGithub}
      targetDescription={'GitHub Gist'}
      fallbackLink={`https://gist.github.com/${id}`}
      data-cypress-id={'click-shield-gist'}>
      <iframe
        sandbox=''
        className={'d-print-none'}
        {...cypressId('gh-gist')}
        width='100%'
        height={`${frameHeight}px`}
        frameBorder='0'
        title={`gist ${id}`}
        src={`https://gist.github.com/${id}.pibb`}
      />
      <span className={`${styles['gist-resizer-row']} d-print-none`}>
        <span className={styles['gist-resizer']} onMouseDown={onStart} onTouchStart={onStart} />
      </span>
    </ClickShield>
  )
}
