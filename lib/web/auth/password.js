import Scrypt from 'scrypt-kdf'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const logger = require('../../logger')
export async function verifyPassword (input, hashed) {
  try {
    return (await Scrypt.verify(Buffer.from(hashed, 'hex'), input))
  } catch (error) {
    logger.error(`Error during login: ${error}`)
    return false
  }
}
