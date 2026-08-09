/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HLJSApi, Language } from 'highlight.js'

/**
 * highlight.js language definition for CNL (Controlled Natural Language)
 * used in nodeBook code fences.
 */
export default function cnlLanguage(_hljs: HLJSApi): Language {
  return {
    name: 'cnl',
    aliases: ['nodeBook'],
    case_insensitive: false,
    contains: [
      // Description blocks: ```description ... ```
      {
        className: 'comment',
        begin: /```description/,
        end: /```/,
        relevance: 10
      },
      // Prolog queries: ?- goal.
      {
        className: 'meta',
        begin: /^\s*\?-/,
        end: /$/,
        contains: [
          {
            className: 'keyword',
            begin: /\b(?:what|who|where|when|how)\b/i
          },
          {
            className: 'number',
            begin: /\b\d+(?:\.\d+)?\b/
          }
        ],
        relevance: 10
      },
      // Wh-word queries (standalone lines starting with wh-word)
      {
        className: 'meta',
        begin: /^\s*(?:what|who|where|when|how)\b/i,
        end: /$/,
        contains: [
          {
            className: 'keyword',
            begin: /\b(?:what|who|where|when|how)\b/i
          },
          {
            className: 'string',
            begin: /<[^>]+>/
          },
          {
            className: 'number',
            begin: /\b\d+(?:\.\d+)?\b/
          }
        ],
        relevance: 5
      },
      // H1 heading: # Node Name [Type]
      {
        className: 'section',
        begin: /^\s*#\s+/,
        end: /$/,
        contains: [
          {
            className: 'type',
            begin: /\[/,
            end: /\]/
          },
          // Bold adjective in heading
          {
            className: 'strong',
            begin: /\*\*/,
            end: /\*\*/
          },
          // Quantifier in heading
          {
            className: 'meta',
            begin: /(?<!\*)\*(?!\*)/,
            end: /\*(?!\*)/
          }
        ],
        relevance: 10
      },
      // H2 morph heading: ## morph name
      {
        className: 'section',
        begin: /^\s*##\s+/,
        end: /$/,
        relevance: 10
      },
      // Directives: expression: or currency:
      {
        className: 'meta',
        begin: /^\s*(?:expression|currency)\s*:/,
        end: /$/,
        relevance: 5
      },
      // Relation: <relation name> Target;  (optionally negated with a leading !)
      {
        className: 'keyword',
        begin: /!?\s*<[^>]+>/,
        relevance: 5
      },
      // Attribute line: key: value;
      {
        begin: /^\s*(?:has\s+)?[\w][\w\s]*?(?=:)/,
        end: /;|$/,
        contains: [
          {
            className: 'attr',
            begin: /^\s*(?:has\s+)?[\w][\w\s]*?(?=:)/,
            relevance: 0
          },
          {
            className: 'punctuation',
            begin: /:/
          },
          {
            className: 'number',
            begin: /\b\d+(?:\.\d+)?\b/
          },
          // Unit: *unit*
          {
            className: 'meta',
            begin: /(?<!\*)\*(?!\*)/,
            end: /\*(?!\*)/
          },
          // Bold inside value
          {
            className: 'strong',
            begin: /\*\*/,
            end: /\*\*/
          },
          {
            className: 'string',
            begin: /(?<=:\s*)/,
            end: /(?=;|$)/,
            contains: [
              {
                className: 'number',
                begin: /\b\d+(?:\.\d+)?\b/
              },
              {
                className: 'meta',
                begin: /(?<!\*)\*(?!\*)/,
                end: /\*(?!\*)/
              }
            ]
          }
        ],
        relevance: 3
      },
      // Semicolons
      {
        className: 'punctuation',
        begin: /;/,
        relevance: 0
      },
      // Numbers (standalone)
      {
        className: 'number',
        begin: /\b\d+(?:\.\d+)?\b/,
        relevance: 0
      },
      // Bold adjective: **adjective**
      {
        className: 'strong',
        begin: /\*\*/,
        end: /\*\*/,
        relevance: 0
      }
    ]
  }
}
