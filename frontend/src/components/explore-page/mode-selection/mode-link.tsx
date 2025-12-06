/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trans, useTranslation } from 'react-i18next'
import styles from './mode-link.module.css'
import type { Mode } from './mode'

export interface ModeLinkProps {
  mode: Mode
}

/**
 * Renders a link to switch to another mode of the explore page

 * @param mode The target mode to link to
 */
export const ModeLink: React.FC<ModeLinkProps> = ({ mode }) => {
  useTranslation()
  const path = usePathname()
  const isActive = useMemo(() => path === `/explore/${mode}`, [path, mode])

  return isActive ? (
    <span className={`${styles.link} ${styles.active}`}>
      <Trans i18nKey={`explore.modes.${mode}`} />
    </span>
  ) : (
    <Link href={`/explore/${mode}`} className={styles.link}>
      <Trans i18nKey={`explore.modes.${mode}`} />
    </Link>
  )
}
