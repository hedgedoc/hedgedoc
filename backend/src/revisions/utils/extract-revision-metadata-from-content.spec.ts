/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractRevisionMetadataFromContent } from './extract-revision-metadata-from-content';

describe('revision entity', () => {
  it('works without frontmatter without first heading', () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      'This is a note content',
    );
    expect(title).toBe('');
    expect(description).toBe('');
    expect(tags).toStrictEqual([]);
  });

  it('works with broken frontmatter', () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '---\ntitle: \n  - 1\n  - 2\n---\nThis is a note content',
    );

    expect(title).toBe('');
    expect(description).toBe('');
    expect(tags).toStrictEqual([]);
  });

  it('works with frontmatter title', () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '---\ntitle: note title\n---\nThis is a note content',
    );

    expect(title).toBe('note title');
    expect(description).toBe('');
    expect(tags).toStrictEqual([]);
  });

  it('works with first heading title', () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '# Note Title Heading\nThis is a note content',
    );

    expect(title).toBe('Note Title Heading');
    expect(description).toBe('');
    expect(tags).toStrictEqual([]);
  });

  it('works with frontmatter description', () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '---\ndescription: note description\n---\nNote content',
    );

    expect(title).toBe('');
    expect(description).toBe('note description');
    expect(tags).toStrictEqual([]);
  });

  it('extracts tags as list', async () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '---\ntags: \n  - tag1\n  - tag2\n---\nNote content',
    );

    expect(title).toBe('');
    expect(description).toBe('');
    expect(tags).toStrictEqual(['tag1', 'tag2']);
  });

  it('extracts tags in legacy syntax', async () => {
    const { title, description, tags } = extractRevisionMetadataFromContent(
      '---\ntags: "tag1, tag2"\n---\nNote content',
    );

    expect(title).toBe('');
    expect(description).toBe('');
    expect(tags).toStrictEqual(['tag1', 'tag2']);
  });
});
