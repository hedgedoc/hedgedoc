/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useChangeEditorContentCallback } from '../change-content-context/use-change-editor-content-callback'
import type { ContentEdits } from '../editor-pane/tool-bar/formatters/types/changes'
import { useNoteMarkdownContent } from '../../../hooks/common/use-note-markdown-content'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import {
  getFileContent,
  loadTargetFromLocalStorage,
  loadTokenFromLocalStorage,
  putFileContent,
  loadLastSyncedSha,
  saveLastSyncedSha
} from '../sidebar/specific-sidebar-entries/sync-sidebar-menu/github-sync-actions'

/**
 * Bridge component that lives inside the editor content context.
 * It listens for global pull/push events and performs content updates.
 * No UI is rendered.
 */
export const GithubSyncBridge: React.FC = () => {
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const changeEditorContent = useChangeEditorContentCallback()
  const currentNoteContent = useNoteMarkdownContent()
  const { showErrorNotification, dispatchUiNotification } = useUiNotifications()

  useEffect(() => {
    const onPull = (): void => {
      const token = loadTokenFromLocalStorage()
      const target = loadTargetFromLocalStorage(noteId)
      if (!token || !target || !changeEditorContent) {
        return
      }
      getFileContent(token, target)
        .then(({ content, sha }) => {
          const formatter = ({ markdownContent }: { markdownContent: string }): [ContentEdits, undefined] => {
            return [
              [
                {
                  from: 0,
                  to: markdownContent.length,
                  insert: content
                }
              ],
              undefined
            ]
          }
          changeEditorContent(formatter as any)
          saveLastSyncedSha(noteId, sha ?? null)
          dispatchUiNotification('notifications.success.title', 'notifications.sync.pullSuccess', {
            durationInSecond: 5
          })
        })
        .catch(showErrorNotification('notifications.sync.pullFailed', undefined, true))
    }

    const onPush = (): void => {
      const token = loadTokenFromLocalStorage()
      const target = loadTargetFromLocalStorage(noteId)
      if (!token || !target) {
        return
      }
      const { sha: storedSha, isKnown } = loadLastSyncedSha(noteId)
      const notifyConflict = (): void => {
        dispatchUiNotification('notifications.error.title', 'notifications.sync.conflictDetected', {
          durationInSecond: 6
        })
      }
      getFileContent(token, target)
        .then(({ sha, content }) => {
          if ((isKnown && storedSha !== sha) || (!isKnown && !!sha)) {
            notifyConflict()
            return undefined
          }
          // No-op push: current editor content equals remote file content
          if (content === currentNoteContent) {
            dispatchUiNotification('notifications.info.title', 'notifications.sync.noChanges', {
              durationInSecond: 4
            })
            return
          }
          return putFileContent(token, target, currentNoteContent, sha).then((newSha) => ({
            newSha,
            previousSha: sha ?? null
          }))
        })
        .then((result) => {
          if (!result) {
            return
          }
          const nextSha = result.newSha ?? result.previousSha ?? null
          saveLastSyncedSha(noteId, nextSha)
          dispatchUiNotification('notifications.success.title', 'notifications.sync.pushSuccess', {
            durationInSecond: 5
          })
        })
        .catch(showErrorNotification('notifications.sync.pushFailed', undefined, true))
    }

    const pullListener = () => onPull()
    const pushListener = () => onPush()
    window.addEventListener('hd2.sync.github.pull', pullListener as EventListener)
    window.addEventListener('hd2.sync.github.push', pushListener as EventListener)
    return () => {
      window.removeEventListener('hd2.sync.github.pull', pullListener as EventListener)
      window.removeEventListener('hd2.sync.github.push', pushListener as EventListener)
    }
  }, [changeEditorContent, currentNoteContent, dispatchUiNotification, noteId, showErrorNotification])

  return null
}


