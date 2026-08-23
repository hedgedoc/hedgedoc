/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export interface FileTypeResult {
  mime: string
  ext: string
}

/**
 * Extracts the file extension and MIME type from a given file buffer with XML-type detection.
 * This is used for uploads and to allow SVGs to be detected properly.
 *
 * @param imageBuffer The buffer of the file to analyze
 * @returns A promise carrying either undefined if the detection failed or the resulting extension and MIME type
 */
export const extractFileType = async (
  imageBuffer: ArrayBuffer | Uint8Array,
): Promise<FileTypeResult | undefined> => {
  const [{ fileTypeFromBuffer }, { detectXml }] = await Promise.all([
    import('file-type'),
    import('@file-type/xml'),
  ])
  return fileTypeFromBuffer(imageBuffer, {
    customDetectors: [detectXml],
  })
}
