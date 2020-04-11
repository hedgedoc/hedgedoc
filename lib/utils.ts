export module Utils {
  export function isSQLite(sequelize) {
    return sequelize.options.dialect === 'sqlite'
  }

  export function getImageMimeType(imagePath: string) {
    const fileExtension = /[^.]+$/.exec(imagePath)
    switch (fileExtension?.[0]) {
      case 'bmp':
        return 'image/bmp'
      case 'gif':
        return 'image/gif'
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'tiff':
        return 'image/tiff'
      case 'svg':
        return 'image/svg+xml'
      default:
        return undefined
    }
  }

  // [Postgres] Handling NULL bytes
  // https://github.com/sequelize/sequelize/issues/6485
  export function stripNullByte(value) {
    value = '' + value
    // eslint-disable-next-line no-control-regex
    return value ? value.replace(/\u0000/g, '') : value
  }

  export function processData (data, _default, process?) {
    if (data === undefined) return data
    else if (process) {
      if (data === null) {
        return _default
      } else {
        return process(data)
      }
    } else {
      if (data === null) {
        return _default
      } else {
        return data
      }
    }
  }
}



