/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import HighlightedCode from '../../../common/highlighted-code/highlighted-code'
import { HtmlToReact } from '../../../common/html-to-react/html-to-react'
import { RendererIframe } from '../../../common/renderer-iframe/renderer-iframe'
import { ExtensionEventEmitterProvider } from '../../../markdown-renderer/hooks/use-extension-event-emitter'
import { RendererType } from '../../../render-page/window-post-message-communicator/rendering-message'
import type { CheatsheetEntry } from '../../cheatsheet/cheatsheet-extension'
import { EditorToRendererCommunicatorContextProvider } from '../../render-context/editor-to-renderer-communicator-context-provider'
import { ReadMoreLinkItem } from './read-more-link-item'
import { useComponentsFromAppExtensions } from './use-components-from-app-extensions'
import MarkdownIt from 'markdown-it'
import React, { useEffect, useMemo, useState } from 'react'
import { ListGroupItem } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

interface CheatsheetRendererProps {
  rootI18nKey?: string
  extension: CheatsheetEntry
}

/**
 * Renders the cheatsheet entry with description, example and rendered example.
 *
 * @param extension The extension to render
 * @param rootI18nKey An additional i18n namespace
 */
export const CheatsheetEntryPane: React.FC<CheatsheetRendererProps> = ({ extension, rootI18nKey }) => {
  const { t } = useTranslation()

  const [content, setContent] = useState('')

  const lines = useMemo(() => content.split('\n'), [content])

  const i18nPrefix = useMemo(
    () => `cheatsheet.${rootI18nKey ? `${rootI18nKey}.` : ''}${extension.i18nKey}.`,
    [extension.i18nKey, rootI18nKey]
  )

  useEffect(() => {
    setContent(t(`${i18nPrefix}example`) ?? '')
  }, [extension, i18nPrefix, t])

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
        <ReadMoreLinkItem url={extension.readMoreUrl}></ReadMoreLinkItem>
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
          />
        </ListGroupItem>
      </ExtensionEventEmitterProvider>
    </EditorToRendererCommunicatorContextProvider>
  )
}
