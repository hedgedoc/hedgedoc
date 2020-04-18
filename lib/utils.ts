import { Sequelize } from 'sequelize-typescript'
import { logger } from './logger'
import { realtime } from './realtime'
import { config } from './config'
import fs from 'fs'
import { Revision } from './models'

export function isSQLite (sequelize: Sequelize): boolean {
  return sequelize.options.dialect === 'sqlite'
}

export function getImageMimeType (imagePath: string): string | undefined {
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
export function stripNullByte (value: string): string {
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

export function handleTermSignals (io): void {
  logger.info('CodiMD has been killed by signal, try to exit gracefully...')
  realtime.maintenance = true
  // disconnect all socket.io clients
  Object.keys(io.sockets.sockets).forEach(function (key) {
    const socket = io.sockets.sockets[key]
    // notify client server going into maintenance status
    socket.emit('maintenance')
    setTimeout(function () {
      socket.disconnect(true)
    }, 0)
  })
  if (config.path) {
    // ToDo: add a proper error handler
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    fs.unlink(config.path, (_) => {})
  }
  const checkCleanTimer = setInterval(function () {
    if (realtime.isReady()) {
      Revision.checkAllNotesRevision(function (err, notes) {
        if (err) {
          return logger.error(err)
        }
        if (!notes || notes.length <= 0) {
          clearInterval(checkCleanTimer)
          return process.exit(0)
        }
      })
    }
  }, 100)
}
