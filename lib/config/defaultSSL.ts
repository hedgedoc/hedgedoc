import fs from 'fs'

function getFile (path): string | undefined {
  if (fs.existsSync(path)) {
    return path
  }
  return undefined
}

export const defaultSSL = {
  sslKeyPath: getFile('/run/secrets/key.pem'),
  sslCertPath: getFile('/run/secrets/cert.pem'),
  sslCAPath: getFile('/run/secrets/ca.pem') !== undefined ? [getFile('/run/secrets/ca.pem')] : [],
  dhParamPath: getFile('/run/secrets/dhparam.pem')
}
