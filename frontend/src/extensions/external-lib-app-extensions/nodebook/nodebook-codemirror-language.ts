/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  HighlightStyle,
  LanguageDescription,
  LanguageSupport,
  StreamLanguage,
  syntaxHighlighting,
  type StringStream,
  type StreamParser
} from '@codemirror/language'
import { Tag } from '@lezer/highlight'

interface CnlState {
  inDescription: boolean
}

function startState(): CnlState {
  return { inDescription: false }
}

function copyState(state: CnlState): CnlState {
  return { inDescription: state.inDescription }
}

/** Custom tags so our HighlightStyle only targets CNL tokens. */
const cnlTag = {
  heading: Tag.define(),
  keyword: Tag.define(),
  typeName: Tag.define(),
  propertyName: Tag.define(),
  string: Tag.define(),
  number: Tag.define(),
  meta: Tag.define(),
  comment: Tag.define(),
  emphasis: Tag.define(),
  punctuation: Tag.define()
}

function token(stream: StringStream, state: CnlState): string | null {
  // Inside ```description block
  if (state.inDescription) {
    if (stream.match(/^```/)) {
      state.inDescription = false
      return 'comment'
    }
    stream.skipToEnd()
    return 'comment'
  }

  // Start of ```description block
  if (stream.match(/^```description/)) {
    state.inDescription = true
    return 'comment'
  }

  // Start of line checks
  if (stream.sol()) {
    // Prolog query: ?- goal.
    if (stream.match(/^\s*\?-/)) {
      stream.skipToEnd()
      return 'meta'
    }

    // Wh-word query line
    if (stream.match(/^\s*(?:what|who|where|when|how)\b/i)) {
      stream.skipToEnd()
      return 'meta'
    }

    // Directive: expression: or currency:
    if (stream.match(/^\s*(?:expression|currency)\s*:/)) {
      stream.skipToEnd()
      return 'meta'
    }

    // H2 morph heading: ## morph name
    if (stream.match(/^\s*##\s+.*/)) {
      return 'heading'
    }

    // H1 heading: # Node Name [Type]
    if (stream.match(/^\s*#\s+/)) {
      stream.skipToEnd()
      return 'heading'
    }
  }

  // Bold: **adjective**
  if (stream.match(/^\*\*[^*]+\*\*/)) {
    return 'emphasis'
  }

  // Relation: <relation name>, optionally negated with a leading ! (e.g. !<has> ear;)
  if (stream.match(/^!\s*<[^>]+>/) || stream.match(/^<[^>]+>/)) {
    return 'keyword'
  }

  // Type bracket: [Type]
  if (stream.match(/^\[[^\]]+\]/)) {
    return 'typeName'
  }

  // Unit: *unit* (single asterisks, not double)
  if (stream.peek() === '*' && !stream.match(/^\*\*/, false)) {
    stream.next()
    if (stream.skipTo('*')) {
      stream.next()
      return 'meta'
    }
    return null
  }

  // Number
  if (stream.match(/^\d+(?:\.\d+)?/)) {
    return 'number'
  }

  // Semicolon
  if (stream.peek() === ';') {
    stream.next()
    return 'punctuation'
  }

  // Attribute key: look for "word:" or "has word:" patterns at line start
  if (stream.sol() || stream.pos === 0) {
    if (stream.match(/^(?:has\s+)?[\w][\w\s]*?(?=:)/)) {
      return 'propertyName'
    }
  }

  // Colon after property name
  if (stream.peek() === ':') {
    stream.next()
    return 'punctuation'
  }

  stream.next()
  return null
}

const cnlParser: StreamParser<CnlState> = {
  startState,
  copyState,
  token,
  tokenTable: {
    heading: cnlTag.heading,
    keyword: cnlTag.keyword,
    typeName: cnlTag.typeName,
    propertyName: cnlTag.propertyName,
    string: cnlTag.string,
    number: cnlTag.number,
    meta: cnlTag.meta,
    comment: cnlTag.comment,
    emphasis: cnlTag.emphasis,
    punctuation: cnlTag.punctuation
  }
}

const cnlStreamLanguage = StreamLanguage.define(cnlParser)

/**
 * GitHub Light theme — matches highlight.js github.css used in rendered view.
 */
const cnlLightStyle = HighlightStyle.define(
  [
    { tag: cnlTag.heading, color: '#005cc5', fontWeight: 'bold' },
    { tag: cnlTag.keyword, color: '#d73a49' },
    { tag: cnlTag.typeName, color: '#d73a49' },
    { tag: cnlTag.propertyName, color: '#005cc5' },
    { tag: cnlTag.string, color: '#032f62' },
    { tag: cnlTag.number, color: '#005cc5' },
    { tag: cnlTag.meta, color: '#005cc5' },
    { tag: cnlTag.comment, color: '#6a737d', fontStyle: 'italic' },
    { tag: cnlTag.emphasis, fontWeight: 'bold' },
    { tag: cnlTag.punctuation, color: '#24292e' }
  ],
  { themeType: 'light' }
)

/**
 * GitHub Dark theme — matches highlight.js github-dark.css used in rendered view.
 */
const cnlDarkStyle = HighlightStyle.define(
  [
    { tag: cnlTag.heading, color: '#1f6feb', fontWeight: 'bold' },
    { tag: cnlTag.keyword, color: '#ff7b72' },
    { tag: cnlTag.typeName, color: '#ff7b72' },
    { tag: cnlTag.propertyName, color: '#79c0ff' },
    { tag: cnlTag.string, color: '#a5d6ff' },
    { tag: cnlTag.number, color: '#79c0ff' },
    { tag: cnlTag.meta, color: '#79c0ff' },
    { tag: cnlTag.comment, color: '#8b949e', fontStyle: 'italic' },
    { tag: cnlTag.emphasis, fontWeight: 'bold' },
    { tag: cnlTag.punctuation, color: '#c9d1d9' }
  ],
  { themeType: 'dark' }
)

export const cnlLanguageDescription = LanguageDescription.of({
  name: 'nodeBook',
  alias: ['cnl'],
  support: new LanguageSupport(cnlStreamLanguage, [syntaxHighlighting(cnlLightStyle), syntaxHighlighting(cnlDarkStyle)])
})
