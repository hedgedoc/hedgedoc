/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useExtensionEventEmitterHandler } from '../../../components/markdown-renderer/hooks/use-extension-event-emitter'
import { updateNoteTitleByFirstHeading } from '../../../redux/note-details/methods'
import { ExtractFirstHeadlineNodeProcessor } from './extract-first-headline-node-processor'
import type React from 'react'

/**
 * Receives the {@link ExtractFirstHeadlineNodeProcessor.EVENT_NAME first heading extraction event}
 * and saves the title in the global application state.
 */
export const ExtractFirstHeadlineEditorExtension: React.FC = () => {
  useExtensionEventEmitterHandler(ExtractFirstHeadlineNodeProcessor.EVENT_NAME, updateNoteTitleByFirstHeading)
  return null
}
