/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { usePlaceholderSizeStyle } from '../../../../extensions/essential-app-extensions/image-placeholder/hooks/use-placeholder-size-style'
import { UiIcon } from '../../../common/icons/ui-icon'
import React from 'react'
import { GearFill as IconGearFill } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'

export interface UploadIndicatingFrameProps {
  width?: string | number
  height?: string | number
}

/**
 * Shows a placeholder frame for images that are currently uploaded.
 *
 * @param width The frame width
 * @param height The frame height
 */
export const UploadIndicatingFrame: React.FC<UploadIndicatingFrameProps> = ({ width, height }) => {
  const containerStyle = usePlaceholderSizeStyle(width, height)
  useTranslation()

  return (
    <span
      className='image-drop d-inline-flex flex-column align-items-center justify-content-center bg-primary text-white p-4'
      style={containerStyle}>
      <span className={'h1 border-bottom-0 my-2'}>
        <Trans i18nKey={'renderer.uploadIndicator.uploadMessage'} />
      </span>
      <UiIcon icon={IconGearFill} size={5} className='my-2' spin={true} />
    </span>
  )
}
