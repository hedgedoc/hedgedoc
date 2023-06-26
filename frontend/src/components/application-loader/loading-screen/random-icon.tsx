/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './animations.module.scss'
import React, { Fragment, useEffect, useState } from 'react'
import type { Icon } from 'react-bootstrap-icons'
import {
  File as IconFile,
  FileText as IconFileText,
  Fonts as IconFonts,
  Gear as IconGear,
  KeyboardFill as IconKeyboardFill,
  ListCheck as IconListCheck,
  Markdown as IconMarkdown,
  Pencil as IconPencil,
  Person as IconPerson,
  Tag as IconTag,
  TypeBold as IconTypeBold,
  TypeItalic as IconTypeItalic
} from 'react-bootstrap-icons'

const elements: Icon[] = [
  IconFileText,
  IconMarkdown,
  IconPencil,
  IconTypeBold,
  IconTypeItalic,
  IconListCheck,
  IconTag,
  IconPerson,
  IconFile,
  IconKeyboardFill,
  IconGear,
  IconFonts
]

/**
 * Chooses a random icon from a predefined set and renders it.
 *
 * The component uses a static icon in the first rendering and will choose the random icon after that.
 * This is done because if the loading screen is prepared using SSR and then hydrated in the client, the rendered css class isn't the expected one from the SSR. (It's random. d'uh).
 * To avoid this problem the icon will be chosen in an effect because SSR won't run effects.
 *
 * See https://nextjs.org/docs/messages/react-hydration-error
 */
export const RandomIcon: React.FC = () => {
  const [icon, setIcon] = useState<JSX.Element | undefined>()

  useEffect(() => {
    const index = Math.floor(Math.random() * elements.length)
    setIcon(React.createElement(elements[index], { className: styles.particle }))
  }, [])

  return <Fragment>{icon}</Fragment>
}
