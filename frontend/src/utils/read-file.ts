/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum FileContentFormat {
  TEXT,
  DATA_URL
}

/**
 * Reads the given {@link File}.
 *
 * @param file The file to read
 * @param fileReaderMode Defines as what the file content should be formatted.
 * @throws {Error} if an invalid read mode was given or if the file couldn't be read.
 * @return the file content
 */
export const readFile = async (file: Blob, fileReaderMode: FileContentFormat): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string)
    })
    fileReader.addEventListener('error', (errorObj) => {
      reject(new Error(JSON.stringify(errorObj)))
    })
    switch (fileReaderMode) {
      case FileContentFormat.DATA_URL:
        fileReader.readAsDataURL(file)
        break
      case FileContentFormat.TEXT:
        fileReader.readAsText(file)
        break
      default:
        throw new Error('Unknown file reader mode')
    }
  })
}
