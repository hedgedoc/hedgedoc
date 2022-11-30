/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import type { IconName } from '../../common/fork-awesome/types'
import styles from './animations.module.scss'
import React, { useEffect, useState } from 'react'

const elements: IconName[] = [
  'file-text',
  'markdown',
  'pencil',
  'bold',
  'italic',
  'align-justify',
  'tag',
  'user',
  'file',
  'keyboard-o',
  'cog',
  'font'
]

/**
 * Chooses a random fork awesome icon from a predefined set and renders it.
 *
 * The component uses a static icon in the first rendering and will choose the random icon after that.
 * This is done because if the loading screen is prepared using SSR and then hydrated in the client, the rendered css class isn't the expected one from the SSR. (It's random. d'uh).
 * To avoid this problem the icon will be chosen in an effect because SSR won't run effects.
 *
 * See https://nextjs.org/docs/messages/react-hydration-error
 */
export const RandomIcon: React.FC = () => {
  const [icon, setIcon] = useState<number | undefined>()

  useEffect(() => {
    setIcon(Math.floor(Math.random() * elements.length))
  }, [])

  return icon === undefined ? null : (
    <ForkAwesomeIcon icon={elements[icon]} className={styles.particle}></ForkAwesomeIcon>
  )
}
