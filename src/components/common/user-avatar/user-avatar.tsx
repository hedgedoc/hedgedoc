/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ShowIf } from '../show-if/show-if'
import Image from 'next/image'
import styles from './user-avatar.module.scss'

export interface UserAvatarProps {
  size?: 'sm' | 'lg'
  name: string
  photo: string
  additionalClasses?: string
  showName?: boolean
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, photo, size, additionalClasses = '', showName = true }) => {
  const { t } = useTranslation()

  const imageSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return 16
      case 'lg':
        return 30
      default:
        return 20
    }
  }, [size])

  return (
    <span className={'d-inline-flex align-items-center ' + additionalClasses}>
      <Image
        src={photo}
        className={`rounded`}
        alt={t('common.avatarOf', { name })}
        title={name}
        height={imageSize}
        width={imageSize}
        layout={'fixed'}
      />
      <ShowIf condition={showName}>
        <span className={`ml-2 mr-1 ${styles['user-line-name']}`}>{name}</span>
      </ShowIf>
    </span>
  )
}

export { UserAvatar }
