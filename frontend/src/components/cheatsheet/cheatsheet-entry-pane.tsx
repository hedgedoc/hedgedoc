/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import HighlightedCode from '../common/highlighted-code/highlighted-code'
import { HtmlToReact } from '../common/html-to-react/html-to-react'
import { RendererIframe } from '../common/renderer-iframe/renderer-iframe'
import { EditorToRendererCommunicatorContextProvider } from '../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { ExtensionEventEmitterProvider } from '../markdown-renderer/hooks/use-extension-event-emitter'
import { RendererType } from '../render-page/window-post-message-communicator/rendering-message'
import type { CheatsheetEntry } from './cheatsheet-extension'
import { ReadMoreLinkItem } from './read-more-link-item'
import { useComponentsFromAppExtensions } from './use-components-from-app-extensions'
import MarkdownIt from 'markdown-it'
import React, { useEffect, useMemo, useState } from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface CheatsheetRendererProps {
  i18nKeyPrefix?: string
  entry: CheatsheetEntry
}

/**
 * Renders the cheatsheet entry with description, example and rendered example.
 *
 * @param extension The extension to render
 * @param rootI18nKey An additional i18n namespace
 */
export const CheatsheetEntryPane: React.FC<CheatsheetRendererProps> = ({ entry, i18nKeyPrefix }) => {
  const { t } = useTranslation()

  const [content, setContent] = useState('')

  const lines = useMemo(() => content.split('\n'), [content])

  const i18nPrefix = useMemo(
    () => `cheatsheet.${i18nKeyPrefix !== undefined ? i18nKeyPrefix + '.' : ''}${entry.i18nKey}.`,
    [entry.i18nKey, i18nKeyPrefix]
  )

  useEffect(() => {
    setContent(t(`${i18nPrefix}example`) ?? '')
  }, [entry, i18nPrefix, t])

  const cheatsheetExtensionComponents = useComponentsFromAppExtensions(setContent)

  const descriptionElements = useMemo(() => {
    const content = t(`${i18nPrefix}description`)
    const markdownIt = new MarkdownIt('default')
    return <HtmlToReact htmlCode={markdownIt.render(content)}></HtmlToReact>
  }, [i18nPrefix, t])

  return (
    <EditorToRendererCommunicatorContextProvider>
      <ExtensionEventEmitterProvider>
        {cheatsheetExtensionComponents}
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.description'} />
          </h4>
          {descriptionElements}
        </ListGroupItem>
        <ReadMoreLinkItem url={entry.readMoreUrl}></ReadMoreLinkItem>
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.exampleInput'} />
          </h4>
          <HighlightedCode code={content} wrapLines={true} language={'markdown'} startLineNumber={1} />
        </ListGroupItem>
        <ListGroupItem>
          <h4>
            <Trans i18nKey={'cheatsheet.modal.headlines.exampleOutput'} />
          </h4>
          <RendererIframe
            frameClasses={'w-100'}
            adaptFrameHeightToContent={true}
            rendererType={RendererType.SIMPLE}
            markdownContentLines={lines}
            showWaitSpinner={true}
          />
        </ListGroupItem>
      </ExtensionEventEmitterProvider>
    </EditorToRendererCommunicatorContextProvider>
  )
}
