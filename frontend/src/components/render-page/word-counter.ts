/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import wordsCount from 'words-count'

/** List of HTML tag names that should not be counted. */
const EXCLUDED_TAGS = ['img', 'pre', 'nav']
/** List of class names that should not be counted. */
const EXCLUDED_CLASSES = ['katex-mathml']

/**
 * Checks whether the given node is an excluded HTML tag and therefore should be
 * excluded from counting.
 *
 * @param node The node to test.
 * @return {@link true} if the node should be excluded, {@link false} otherwise.
 */
const isExcludedTag = (node: Element | ChildNode): boolean => {
  return EXCLUDED_TAGS.includes(node.nodeName.toLowerCase())
}

/**
 * Checks whether the given node is a HTML element with an excluded class name,
 * so that it should be excluded.
 *
 * @param node The node to test.
 * @return {@link true} if the node should be excluded, {@link false} otherwise.
 */
const isExcludedClass = (node: Element | ChildNode): boolean => {
  return EXCLUDED_CLASSES.some((excludedClass) => (node as HTMLElement).classList?.contains(excludedClass))
}

/**
 * Counts the words of the given node while ignoring empty nodes and excluded
 * nodes. Child nodes will recursively be counted as well.
 *
 * @param node The node whose content's words should be counted.
 * @return The number of words counted in this node and its children.
 */
export const countWords = (node: Element | ChildNode): number => {
  if (!node.textContent || isExcludedTag(node) || isExcludedClass(node)) {
    return 0
  }
  if (!node.hasChildNodes()) {
    return wordsCount(node.textContent)
  }
  return [...node.childNodes].reduce((words, childNode) => {
    return words + countWords(childNode)
  }, 0)
}
