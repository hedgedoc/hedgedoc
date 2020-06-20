import MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji'
import markdownItRegex from 'markdown-it-regex'
import taskList from 'markdown-it-task-lists'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import React, { ReactElement, useMemo } from 'react'
import ReactHtmlParser, { convertNodeToElement, Transform } from 'react-html-parser'
import { MarkdownItParserDebugger } from './markdown-it-plugins/parser-debugger'
import './markdown-preview.scss'
import { replaceGistLink } from './regex-plugins/replace-gist-link'
import { replaceLegacyGistShortCode } from './regex-plugins/replace-legacy-gist-short-code'
import { replaceLegacySlideshareShortCode } from './regex-plugins/replace-legacy-slideshare-short-code'
import { replaceLegacySpeakerdeckShortCode } from './regex-plugins/replace-legacy-speakerdeck-short-code'
import { replaceLegacyVimeoShortCode } from './regex-plugins/replace-legacy-vimeo-short-code'
import { replaceLegacyYoutubeShortCode } from './regex-plugins/replace-legacy-youtube-short-code'
import { replaceVimeoLink } from './regex-plugins/replace-vimeo-link'
import { replaceYouTubeLink } from './regex-plugins/replace-youtube-link'
import { getGistReplacement } from './replace-components/gist/gist-frame'
import { getVimeoReplacement } from './replace-components/vimeo/vimeo-frame'
import { getYouTubeReplacement } from './replace-components/youtube/youtube-frame'

export interface MarkdownPreviewProps {
  content: string
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const markdownIt = useMemo(() => {
    const md = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      linkify: false,
      typographer: true
    })
    md.use(taskList)
    md.use(emoji)
    md.use(subscript)
    md.use(superscript)
    md.use(inserted)
    md.use(marked)
    md.use(markdownItRegex, replaceLegacyYoutubeShortCode)
    md.use(markdownItRegex, replaceLegacyVimeoShortCode)
    md.use(markdownItRegex, replaceLegacyGistShortCode)
    md.use(markdownItRegex, replaceLegacySlideshareShortCode)
    md.use(markdownItRegex, replaceLegacySpeakerdeckShortCode)
    md.use(markdownItRegex, replaceYouTubeLink)
    md.use(markdownItRegex, replaceVimeoLink)
    md.use(markdownItRegex, replaceGistLink)
    md.use(MarkdownItParserDebugger)
    return md
  }, [])

  const result: ReactElement[] = useMemo(() => {
    const youtubeIdCounterMap = new Map<string, number>()
    const vimeoIdCounterMap = new Map<string, number>()
    const gistIdCounterMap = new Map<string, number>()

    const html: string = markdownIt.render(content)
    const transform: Transform = (node, index) => {
      const resultYT = getYouTubeReplacement(node, youtubeIdCounterMap)
      if (resultYT) {
        return resultYT
      }

      const resultVimeo = getVimeoReplacement(node, vimeoIdCounterMap)
      if (resultVimeo) {
        return resultVimeo
      }

      const resultGist = getGistReplacement(node, gistIdCounterMap)
      if (resultGist) {
        return resultGist
      }

      return convertNodeToElement(node, index, transform)
    }
    const ret: ReactElement[] = ReactHtmlParser(html, { transform: transform })
    return ret
  }, [content, markdownIt])

  return (
    <div className={'bg-light container-fluid flex-fill h-100 overflow-y-scroll pb-5'}>
      <div className={'markdown-body container-fluid'}>{result}</div>
    </div>
  )
}

export { MarkdownPreview }
