/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CommunicationMessageType } from '../window-post-message-communicator/rendering-message'
import { useRendererReceiveHandler } from '../window-post-message-communicator/hooks/use-renderer-receive-handler'
import { useMemo } from 'react'
import clickShieldCss from '../../markdown-renderer/replace-components/click-shield/click-shield.module.scss'
import highlightedCodeCss from '../../common/highlighted-code/highlighted-code.module.scss'
import copyButtonCss from '../../common/copyable/copy-to-clipboard-button/style.module.scss'
import markdownDocumentCss from '../../render-page/renderers/document/markdown-document.module.scss'
import markdownTocButtonCss from '../../render-page/markdown-toc-button/markdown-toc-button.module.scss'
import type { RendererToEditorCommunicator } from '../window-post-message-communicator/renderer-to-editor-communicator'
import { Logger } from '../../../utils/logger'
import { fetchAsBase64 } from '../../common/fetch-as-base64/fetch-as-base64'

const logger = new Logger('useOnHtmlExportRequest')
const URL_IN_CSS_REGEX = /url\(([\w./-]+)\)/g

/**
 * Builds a hook that grabs and transforms the markdown HTML content for sending it back to the iframe host
 * for downloading. The transformations include removing click shields, interactive buttons and invalid links.
 *
 * @param communicator The iframe communicator to use for receiving events on
 */
export const useOnHtmlExportRequest = (communicator: RendererToEditorCommunicator) => {
  useRendererReceiveHandler(
    CommunicationMessageType.EXPORT_HTML_REQUEST,
    useMemo(
      () =>
        async ({ noteUrl, withStyles, noteTitle }) => {
          let finalHtml: string
          const rootElementQuery = withStyles ? `.${markdownDocumentCss.document}` : '.markdown-body'
          const documentContainer = document.querySelector(rootElementQuery)
          if (!documentContainer) {
            return
          }
          const exportMarkdownBodyElement = document.createElement('div')
          exportMarkdownBodyElement.innerHTML = documentContainer.innerHTML
          cleanupHtmlForExport(exportMarkdownBodyElement, noteUrl)

          if (withStyles) {
            await extractImagesToBase64(exportMarkdownBodyElement)
            const finalHtmlElement = await buildFullHtmlPageForExport(exportMarkdownBodyElement, noteTitle)
            finalHtml = finalHtmlElement.outerHTML
          } else {
            finalHtml = exportMarkdownBodyElement.innerHTML
          }

          communicator.sendMessageToOtherSide({
            type: CommunicationMessageType.EXPORT_HTML_RESPONSE,
            html: finalHtml
          })
        },
      [communicator]
    )
  )
}

/**
 * Cleans the DOM for the export beginning from the given root element by removing unwanted buttons and elements
 * and replacing all hardcoded links to the note itself.
 *
 * @param rootElement The element to work on. This will be modified.
 * @param noteUrl The URL of the note itself to replace it with relative links
 */
const cleanupHtmlForExport = (rootElement: HTMLElement, noteUrl: string): void => {
  ;[
    ...rootElement.querySelectorAll(`.${clickShieldCss['click-shield']}`),
    ...rootElement.querySelectorAll(`.${copyButtonCss['copy-button']}`),
    ...rootElement.querySelectorAll(`.${highlightedCodeCss['linenumber']}`),
    ...rootElement.querySelectorAll(`.${markdownTocButtonCss['markdown-toc-sidebar-button']}`)
  ].forEach((element) => element.remove())
  rootElement.querySelectorAll('a[href]').forEach((element) => {
    const href = element.getAttribute('href')
    if (!href || !href.startsWith(noteUrl)) {
      return
    }
    element.setAttribute('href', href.replace(noteUrl, ''))
  })
  rootElement.querySelectorAll('.print-only').forEach((element) => {
    element.classList.remove('print-only')
  })
}

/**
 * Iterates over all <img> tags in the given HTML, downloads them and embeds them as base64 inline
 *
 * @param rootElement The root element to work on. This will be modified.
 */
const extractImagesToBase64 = async (rootElement: HTMLElement): Promise<void> => {
  for (const element of rootElement.querySelectorAll('img')) {
    const imageUrl = element.getAttribute('src')
    if (!imageUrl) {
      continue
    }
    try {
      const base64ImageUri = await fetchAsBase64(imageUrl)
      element.setAttribute('src', base64ImageUri)
    } catch (error) {
      logger.error(`Error fetching image for export\nURL: ${imageUrl}\nError: ${String(error)}`)
    }
  }
}

/**
 * Iterates over all external stylesheets of the given element, downloads them and embeds them inline
 *
 * @param rootElement The root element to work on. This will not be modified.
 * @returns A new <style> element containing all inlined styles.
 */
const extractStylesheetsToCombinedStyleElement = async (rootElement: HTMLElement): Promise<HTMLStyleElement> => {
  const stylesheetElements = rootElement.querySelectorAll('link[rel="stylesheet"]')
  const allCssContent = []
  for (const element of stylesheetElements) {
    const cssUrl = element.getAttribute('href')
    if (!cssUrl) {
      continue
    }
    try {
      const cssResponse = await fetch(cssUrl)
      const cssContent = await cssResponse.text()
      allCssContent.push(cssContent)
    } catch (error) {
      logger.error(`Error fetching stylesheet for export\nURL: ${cssUrl}\nError: ${String(error)}`)
    }
  }
  const allCssString = allCssContent.join('\n')
  const allCssElement = document.createElement('style')
  const foundUrls = allCssString.matchAll(URL_IN_CSS_REGEX)
  const urlToBase64Map = new Map<string, string>()
  for (const regexResult of foundUrls) {
    if (regexResult.length < 2) {
      continue
    }
    const foundUrl = regexResult[1]
    const fontAsBase64Uri = await fetchAsBase64(foundUrl)
    urlToBase64Map.set(foundUrl, fontAsBase64Uri)
  }
  allCssElement.innerHTML = allCssString.replaceAll(URL_IN_CSS_REGEX, (original, foundUrl) => {
    if (urlToBase64Map.has(foundUrl)) {
      return `url(${urlToBase64Map.get(foundUrl)})`
    }
    return original
  })
  return allCssElement
}

/**
 * Builds a full HTML page for export using the combined and inlined CSS and the given prepared body for export
 *
 * @param markdownBodyElement The preprocessed markdown content body element to use for the page
 * @param title The note title to use for the <title> element
 * @returns The full assembled HTML element for the export file
 */
const buildFullHtmlPageForExport = async (
  markdownBodyElement: HTMLElement,
  title: string
): Promise<HTMLHtmlElement> => {
  const combinedStyleElement = await extractStylesheetsToCombinedStyleElement(document.head)
  const fullHtmlElement = document.createElement('html')
  const htmlHeadElement = document.createElement('head')
  const htmlBodyElement = document.createElement('body')

  const titleElement = document.createElement('title')
  titleElement.innerText = title
  const charsetMetaElement = document.createElement('meta')
  charsetMetaElement.setAttribute('charset', 'utf-8')

  htmlHeadElement.appendChild(charsetMetaElement)
  htmlHeadElement.appendChild(titleElement)
  htmlHeadElement.appendChild(combinedStyleElement)

  htmlBodyElement.appendChild(markdownBodyElement)

  fullHtmlElement.appendChild(htmlHeadElement)
  fullHtmlElement.appendChild(htmlBodyElement)
  return fullHtmlElement
}
