/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { IconName } from '../../../common/fork-awesome/types'
import { ShowIf } from '../../../common/show-if/show-if'
import './one-click-embedding.scss'
import { ProxyImageFrame } from '../image/proxy-image-frame'
import { Logger } from '../../../../utils/logger'

const log = new Logger('OneClickEmbedding')

interface OneClickFrameProps {
  onImageFetch?: () => Promise<string>
  loadingImageUrl?: string
  hoverIcon?: IconName
  hoverTextI18nKey?: string
  targetDescription?: string
  containerClassName?: string
  previewContainerClassName?: string
  onActivate?: () => void
}

export const OneClickEmbedding: React.FC<OneClickFrameProps> = ({
  previewContainerClassName,
  containerClassName,
  onImageFetch,
  loadingImageUrl,
  children,
  targetDescription,
  hoverIcon,
  onActivate
}) => {
  const [showFrame, setShowFrame] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState(loadingImageUrl)
  const { t } = useTranslation()

  const showChildren = () => {
    setShowFrame(true)
    if (onActivate) {
      onActivate()
    }
  }

  useEffect(() => {
    if (!onImageFetch) {
      return
    }
    onImageFetch()
      .then((imageLink) => {
        setPreviewImageUrl(imageLink)
      })
      .catch((message) => {
        log.error(message)
      })
  }, [onImageFetch])

  const previewHoverText = useMemo(() => {
    return targetDescription ? t('renderer.one-click-embedding.previewHoverText', { target: targetDescription }) : ''
  }, [t, targetDescription])

  return (
    <span className={containerClassName}>
      <ShowIf condition={showFrame}>{children}</ShowIf>
      <ShowIf condition={!showFrame}>
        <span className={`one-click-embedding ${previewContainerClassName || ''}`} onClick={showChildren}>
          <ShowIf condition={!!previewImageUrl}>
            <ProxyImageFrame
              className={'one-click-embedding-preview'}
              src={previewImageUrl}
              alt={previewHoverText}
              title={previewHoverText}
            />
          </ShowIf>
          <ShowIf condition={!!hoverIcon}>
            <span className='one-click-embedding-icon text-center'>
              <i className={`fa fa-${hoverIcon as string} fa-5x mb-2`} />
            </span>
          </ShowIf>
        </span>
      </ShowIf>
    </span>
  )
}
