/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const TRANSLATIONS_FILE = resolve(import.meta.dirname, '../locales/en.json')

/**
 * Recursively traverses the given JS object and collects all keys in dot-notation.
 *
 * @param translations {Object} The input object to traverse
 * @param prefix {string} The optional prefix to use in front of the current keys, used for recursive calls.
 * @returns {Set<string>} A set of collected keys in dot-notation
 */
const collectTranslationKeys = (translations, prefix = '') => {
  const keys = new Set()

  for (const [key, value] of Object.entries(translations)) {
    const translationKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      for (const nestedKey of collectTranslationKeys(value, translationKey)) {
        keys.add(nestedKey)
      }
    } else {
      keys.add(translationKey)
    }
  }

  return keys
}

/**
 * Extracts the string content from a AST node like a method argument.
 * This also tries to resolve template strings if possible.
 *
 * @param node The AST node
 * @returns {undefined|string} The string content from the given node or undefined if not found
 */
const getStaticString = (node) => {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0].value.cooked
  }
  return undefined
}

/**
 * Returns the i18nKey attribute from <Trans> JSX components for a given AST node.
 *
 * @param node The AST node
 * @returns {string|undefined} Either the attribute value as a string or undefined for non-matching JSX components
 */
const getTransKeyNode = (node) => {
  if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'Trans') {
    return undefined
  }
  const attribute = node.attributes.find(
    (candidate) =>
      candidate.type === 'JSXAttribute' && candidate.name.type === 'JSXIdentifier' && candidate.name.name === 'i18nKey'
  )
  if (!attribute?.value) {
    return undefined
  }
  return attribute.value.type === 'JSXExpressionContainer' ? attribute.value.expression : attribute.value
}

const translations = JSON.parse(readFileSync(TRANSLATIONS_FILE, 'utf8'))
const translationKeys = collectTranslationKeys(translations)

export const translationKeysRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Checks that used translation keys exist in en.json'
    },
    schema: [],
    messages: {
      missing: "Translation key '{{key}}' does not exist in locales/en.json."
    }
  },
  createOnce(context) {
    const validateTranslationKey = (node) => {
      const key = getStaticString(node)
      if (key !== undefined && !translationKeys.has(key)) {
        context.report({
          node,
          messageId: 'missing',
          data: { key }
        })
      }
    }

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'useTranslatedText' || node.callee.name === 't')
        ) {
          validateTranslationKey(node.arguments[0])
        }
      },
      JSXOpeningElement(node) {
        const translationKeyNode = getTransKeyNode(node)
        if (translationKeyNode) {
          validateTranslationKey(translationKeyNode)
        }
      }
    }
  }
}
