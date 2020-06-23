import hljs from 'highlight.js'
import React, { Fragment, useMemo } from 'react'
import ReactHtmlParser from 'react-html-parser'
import './highlighted-code.scss'

export interface HighlightedCodeProps {
  code: string,
  language?: string,
  showGutter: boolean
  wrapLines: boolean
}

export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const checkIfLanguageIsSupported = (language: string): boolean => {
  return hljs.listLanguages().indexOf(language) > -1
}

const correctLanguage = (language: string | undefined): string | undefined => {
  switch (language) {
    case 'html':
      return 'xml'
    default:
      return language
  }
}

export const HighlightedCode: React.FC<HighlightedCodeProps> = ({ code, language, showGutter, wrapLines }) => {
  const highlightedCode = useMemo(() => {
    const replacedLanguage = correctLanguage(language)
    return ((!!replacedLanguage && checkIfLanguageIsSupported(replacedLanguage)) ? hljs.highlight(replacedLanguage, code).value : escapeHtml(code))
      .split('\n')
      .filter(line => !!line)
      .map(line => ReactHtmlParser(line))
  }, [code, language])

  return (
    <code className={`hljs ${showGutter ? 'showGutter' : ''} ${wrapLines ? 'wrapLines' : ''}`}>
      {
        highlightedCode
          .map((line, index) => {
            return <Fragment key={index}>
              <span className={'linenumber'} data-line-number={index + 1}/>
              <div className={'line'}>
                {line}
              </div>
            </Fragment>
          })
      }

    </code>)
}
