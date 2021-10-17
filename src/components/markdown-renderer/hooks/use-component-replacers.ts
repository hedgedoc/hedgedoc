/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { AbcReplacer } from '../replace-components/abc/abc-replacer'
import { AsciinemaReplacer } from '../replace-components/asciinema/asciinema-replacer'
import type { ComponentReplacer } from '../replace-components/ComponentReplacer'
import { CsvReplacer } from '../replace-components/csv/csv-replacer'
import { FlowchartReplacer } from '../replace-components/flow/flowchart-replacer'
import { GistReplacer } from '../replace-components/gist/gist-replacer'
import { GraphvizReplacer } from '../replace-components/graphviz/graphviz-replacer'
import { HighlightedCodeReplacer } from '../replace-components/highlighted-fence/highlighted-fence-replacer'
import type { ImageClickHandler } from '../replace-components/image/image-replacer'
import { ImageReplacer } from '../replace-components/image/image-replacer'
import { KatexReplacer } from '../replace-components/katex/katex-replacer'
import { LinemarkerReplacer } from '../replace-components/linemarker/linemarker-replacer'
import { LinkReplacer } from '../replace-components/link-replacer/link-replacer'
import { MarkmapReplacer } from '../replace-components/markmap/markmap-replacer'
import { MermaidReplacer } from '../replace-components/mermaid/mermaid-replacer'
import { ColoredBlockquoteReplacer } from '../replace-components/colored-blockquote/colored-blockquote-replacer'
import { SequenceDiagramReplacer } from '../replace-components/sequence-diagram/sequence-diagram-replacer'
import type { TaskCheckedChangeHandler } from '../replace-components/task-list/task-list-replacer'
import { TaskListReplacer } from '../replace-components/task-list/task-list-replacer'
import { VegaReplacer } from '../replace-components/vega-lite/vega-replacer'
import { VimeoReplacer } from '../replace-components/vimeo/vimeo-replacer'
import { YoutubeReplacer } from '../replace-components/youtube/youtube-replacer'

/**
 * Provides a function that creates a list of {@link ComponentReplacer component replacer} instances.
 *
 * @param onTaskCheckedChange A callback that gets executed if a task checkbox gets clicked
 * @param onImageClick A callback that should be executed if an image gets clicked
 * @param baseUrl The base url for relative links
 * @param frontmatterLinesToSkip The number of lines of the frontmatter part to add this as offset to line-numbers.
 *
 * @return the created list
 */
export const useComponentReplacers = (
  onTaskCheckedChange?: TaskCheckedChangeHandler,
  onImageClick?: ImageClickHandler,
  baseUrl?: string,
  frontmatterLinesToSkip?: number
): ComponentReplacer[] =>
  useMemo(
    () => [
      new LinemarkerReplacer(),
      new GistReplacer(),
      new YoutubeReplacer(),
      new VimeoReplacer(),
      new AsciinemaReplacer(),
      new AbcReplacer(),
      new ImageReplacer(onImageClick),
      new SequenceDiagramReplacer(),
      new CsvReplacer(),
      new FlowchartReplacer(),
      new MermaidReplacer(),
      new GraphvizReplacer(),
      new MarkmapReplacer(),
      new VegaReplacer(),
      new HighlightedCodeReplacer(),
      new ColoredBlockquoteReplacer(),
      new KatexReplacer(),
      new TaskListReplacer(onTaskCheckedChange, frontmatterLinesToSkip),
      new LinkReplacer(baseUrl)
    ],
    [onImageClick, onTaskCheckedChange, baseUrl, frontmatterLinesToSkip]
  )
