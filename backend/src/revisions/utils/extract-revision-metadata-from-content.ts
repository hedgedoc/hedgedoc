/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  convertRawFrontmatterToNoteFrontmatter,
  defaultNoteFrontmatter,
  extractFirstHeading,
  extractFrontmatter,
  generateNoteTitle,
  NoteFrontmatter,
  NoteType,
  parseRawFrontmatterFromYaml,
} from '@hedgedoc/commons';
import { parseDocument } from 'htmlparser2';
import MarkdownIt from 'markdown-it';

interface FrontmatterExtractionResult {
  title: string;
  description: string;
  tags: string[];
  noteType: NoteType;
}

interface FrontmatterParserResult {
  frontmatter: NoteFrontmatter;
  firstLineOfContentIndex: number;
}

/**
 * Parses the frontmatter of the given content and extracts the metadata that are necessary to create a new revision
 *
 * @param content the revision content that contains the frontmatter
 * @returns the extracted metadata, including the title, description, tags, and note type
 */
export function extractRevisionMetadataFromContent(
  content: string,
): FrontmatterExtractionResult {
  const parserResult = parseFrontmatter(content);
  const frontmatter = parserResult?.frontmatter;
  const firstLineOfContentIndex = parserResult?.firstLineOfContentIndex;

  const title = generateNoteTitle(frontmatter, () =>
    extractFirstHeadingFromContent(
      generateContentWithoutFrontmatter(firstLineOfContentIndex, content),
    ),
  );
  const description = frontmatter?.description ?? '';
  const tags = frontmatter?.tags ?? [];
  const noteType = frontmatter?.type ?? NoteType.DOCUMENT;

  return { title, description, tags, noteType };
}

/**
 * Generates the content of a revision without the frontmatter.
 *
 * @param firstLineOfContentIndex the index of the first line of content after the frontmatter
 * @param content the full content including frontmatter
 * @returns the content without frontmatter
 */
function generateContentWithoutFrontmatter(
  firstLineOfContentIndex: number | undefined,
  content: string,
): string {
  return firstLineOfContentIndex === undefined
    ? content
    : content.split('\n').slice(firstLineOfContentIndex).join('\n');
}

/**
 * Parses the frontmatter from the given content and returns the parsed frontmatter and the index of the first line of content.
 *
 * @param content the content to parse
 * @returns an object containing the parsed frontmatter and the index of the first line of content, or undefined if no frontmatter was found
 */
function parseFrontmatter(
  content: string,
): FrontmatterParserResult | undefined {
  const extractionResult = extractFrontmatter(content.split('\n'));
  const rawText = extractionResult?.rawText;
  if (!rawText) {
    return undefined;
  }

  const firstLineOfContentIndex = extractionResult.lineOffset + 1;
  const rawDataValidation = parseRawFrontmatterFromYaml(rawText);
  const noteFrontmatter =
    rawDataValidation.error !== undefined
      ? defaultNoteFrontmatter
      : convertRawFrontmatterToNoteFrontmatter(rawDataValidation.value);
  return {
    frontmatter: noteFrontmatter,
    firstLineOfContentIndex: firstLineOfContentIndex,
  };
}

/**
 * Extracts the first heading from the given markdown content
 *
 * @param content the content to extract the first heading from
 * @returns the first heading or undefined if no heading was found
 */
function extractFirstHeadingFromContent(content: string): string | undefined {
  const markdownIt = new MarkdownIt('default');
  const html = markdownIt.render(content);
  const document = parseDocument(html);
  return extractFirstHeading(document);
}
