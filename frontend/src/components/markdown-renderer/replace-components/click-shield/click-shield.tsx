/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithDataCypressId } from '../../../../utils/cypress-attribute'
import { cypressId } from '../../../../utils/cypress-attribute'
import { Logger } from '../../../../utils/logger'
import { ProxyImageFrame } from '../../extensions/image/proxy-image-frame'
import styles from './click-shield.module.scss'
import type { Property } from 'csstype'
import type { PropsWithChildren } from 'react'
import { Fragment } from 'react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { Icon } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { PrintLink } from './print-link'

const log = new Logger('OneClickEmbedding')

export interface ClickShieldProps extends PropsWithChildren<PropsWithDataCypressId> {
  onImageFetch?: () => Promise<string>
  fallbackPreviewImageUrl?: string
  hoverIcon: Icon
  targetDescription: string
  containerClassName?: string
  fallbackBackgroundColor?: Property.BackgroundColor
  fallbackLink: string
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
  fallbackLink,
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

  const icon = useMemo(
    () =>
      React.createElement(hoverIcon, {
        width: '5em',
        height: '5em',
        className: 'mb-2'
      }),
    [hoverIcon]
  )

  if (showChildren) {
    return (
      <Fragment>
        <span className={containerClassName} {...cypressId(props['data-cypress-id'])}>
          {children}
        </span>
        <PrintLink link={fallbackLink} />
      </Fragment>
    )
  }

  return (
    <Fragment>
      <span className={containerClassName} {...cypressId(props['data-cypress-id'])}>
        <span className={`d-inline-block ratio ratio-16x9 ${styles['click-shield']}`} onClick={doShowChildren}>
          {previewBackground}
          <span className={`${styles['preview-hover']}`}>
            <span>
              <Trans i18nKey={'renderer.clickShield.previewHoverText'} values={hoverTextTranslationValues} />
            </span>
            {icon}
          </span>
        </span>
      </span>
      <PrintLink link={fallbackLink} />
    </Fragment>
  )
}
