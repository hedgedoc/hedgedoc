'use strict'

import * as fs from 'fs'

function getFile (filePath: string): string | undefined {
  if (fs.existsSync(filePath)) {
    return filePath
  }
  return undefined
}

const defaultSSL = {
  sslKeyPath: getFile('/run/secrets/key.pem'),
  sslCertPath: getFile('/run/secrets/cert.pem'),
  sslCAPath: getFile('/run/secrets/ca.pem') !== undefined ? [getFile('/run/secrets/ca.pem')!] : [] as string[],
  dhParamPath: getFile('/run/secrets/dhparam.pem')
}

export = defaultSSL
