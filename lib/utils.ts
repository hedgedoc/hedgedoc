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

}



