/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import type { IconName } from '../../../common/fork-awesome/types'
import { ShowIf } from '../../../common/show-if/show-if'
import styles from './click-shield.module.scss'
import { Logger } from '../../../../utils/logger'
import type { Property } from 'csstype'
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { ProxyImageFrame } from '../../extensions/image/proxy-image-frame'

const log = new Logger('OneClickEmbedding')

export interface ClickShieldProps extends PropsWithChildren<PropsWithDataCypressId> {
  onImageFetch?: () => Promise<string>
  fallbackPreviewImageUrl?: string
  hoverIcon: IconName
  targetDescription: string
  containerClassName?: string
  fallbackBackgroundColor?: Property.BackgroundColor
}

/**
 * Prevents loading of the children elements until the user unlocks the content by e.g. clicking.
 *
 * @param containerClassName Additional CSS classes for the complete component
 * @param onImageFetch A callback that is used to get an URL for the preview image
 * @param fallbackPreviewImageUrl The URL for an image that should be shown. If onImageFetch is defined then this image will be shown until onImageFetch provides another URL.
 * @param targetDescription The name of the target service
 * @param hoverIcon The name of an icon that should be shown in the preview
 * @param fallbackBackgroundColor A color that should be used if no background image was provided or could be loaded.
 * @param children The children element that should be shielded.
 */
export const ClickShield: React.FC<ClickShieldProps> = ({
  containerClassName,
  onImageFetch,
  fallbackPreviewImageUrl,
  children,
  targetDescription,
  hoverIcon,
  fallbackBackgroundColor,
  ...props
}) => {
  const [showChildren, setShowChildren] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState(fallbackPreviewImageUrl)
  const { t } = useTranslation()

  const doShowChildren = useCallback(() => {
    setShowChildren(true)
  }, [])

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

  const fallbackBackgroundStyle = useMemo<React.CSSProperties>(
    () =>
      !fallbackBackgroundColor
        ? {}
        : {
            backgroundColor: fallbackBackgroundColor
          },
    [fallbackBackgroundColor]
  )

  const previewHoverText = useMemo(() => {
    return targetDescription ? t('renderer.clickShield.previewHoverText', { target: targetDescription }) : ''
  }, [t, targetDescription])

  const previewBackground = useMemo(() => {
    return previewImageUrl === undefined ? (
      <span
        className={`${styles['preview-background']} embed-responsive-item`}
        {...cypressId('preview-background')}
        style={fallbackBackgroundStyle}
      />
    ) : (
      <ProxyImageFrame
        {...cypressId('preview-background')}
        className={`${styles['preview-background']} embed-responsive-item`}
        style={fallbackBackgroundStyle}
        src={previewImageUrl}
        alt={previewHoverText}
        title={previewHoverText}
      />
    )
  }, [fallbackBackgroundStyle, previewHoverText, previewImageUrl])

  const hoverTextTranslationValues = useMemo(() => ({ target: targetDescription }), [targetDescription])

  return (
    <span className={containerClassName} {...cypressId(props['data-cypress-id'])}>
      <ShowIf condition={showChildren}>{children}</ShowIf>
      <ShowIf condition={!showChildren}>
        <span className={`${styles['click-shield']} ratio ratio-16x9`} onClick={doShowChildren}>
          {previewBackground}
          <span className={`${styles['preview-hover']}`}>
            <span className={`${styles['preview-hover-text']}`}>
              <Trans i18nKey={'renderer.clickShield.previewHoverText'} values={hoverTextTranslationValues} />
            </span>
            <ForkAwesomeIcon icon={hoverIcon} size={'5x'} className={'mb-2'} />
          </span>
        </span>
      </ShowIf>
    </span>
  )
}
