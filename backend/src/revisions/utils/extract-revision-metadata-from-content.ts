/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
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
  parseRawFrontmatterFromYaml,
} from '@hedgedoc/commons';
import { parseDocument } from 'htmlparser2';
import MarkdownIt from 'markdown-it';

interface FrontmatterExtractionResult {
  title: string;
  description: string;
  tags: string[];
}

interface FrontmatterParserResult {
  frontmatter: NoteFrontmatter;
  firstLineOfContentIndex: number;
}

/**
 * Parses the frontmatter of the given content and extracts the metadata that are necessary to create a new revision..
 *
 * @param {string} content the revision content that contains the frontmatter.
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

  return { title, description, tags };
}

function generateContentWithoutFrontmatter(
  firstLineOfContentIndex: number | undefined,
  content: string,
): string {
  return firstLineOfContentIndex === undefined
    ? content
    : content.split('\n').slice(firstLineOfContentIndex).join('\n');
}

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

function extractFirstHeadingFromContent(content: string): string | undefined {
  const markdownIt = new MarkdownIt('default');
  const html = markdownIt.render(content);
  const document = parseDocument(html);
  return extractFirstHeading(document);
}
