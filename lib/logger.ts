'use strict'

import { createLogger, format, transports } from 'winston'

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.uncolorize(),
    format.timestamp(),
    format.align(),
    format.splat(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      handleExceptions: true
    })
  ],
  exitOnError: false
})

;(logger as any).stream = {
  write: function (message: string) {
    logger.info(message)
  }
}

export = logger
