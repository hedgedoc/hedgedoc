'use client'
/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { Container } from 'react-bootstrap'
import { Welcome } from '../../../components/explore-page/welcome'
import { ModeSelection } from '../../../components/explore-page/mode-selection/mode-selection'
import { PinnedNotes } from '../../../components/explore-page/pinned-notes/pinned-notes'
import { loadPinnedNotes } from '../../../redux/pinned-notes/methods'
import { useUiNotifications } from '../../../components/notifications/ui-notification-boundary'
import { WorkspaceSidebar } from '../../../components/explore-page/workspace/workspace-sidebar'
import styles from '../../../components/explore-page/workspace/workspace.module.scss'

export type ExploreLayoutProps = PropsWithChildren

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  const { showErrorNotificationBuilder } = useUiNotifications()
  useEffect(() => {
    loadPinnedNotes().catch(showErrorNotificationBuilder('explore.pinnedNotes.loadingError'))
  }, [showErrorNotificationBuilder])

  return (
    <div className={styles.workspaceContainer}>
      <WorkspaceSidebar onCreateNote={() => window.location.href = '/new'} />
      
      <div className={styles.mainContent}>
        <Container fluid className={'px-4'}>
          <Welcome />
        </Container>
        
        <PinnedNotes />
        
        <Container fluid className={'px-4'}>
          <ModeSelection />
          {children}
        </Container>
      </div>
    </div>
  )
}
