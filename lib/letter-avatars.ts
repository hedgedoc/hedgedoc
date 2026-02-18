'use strict'

// external modules
import * as crypto from 'crypto'
import Chance = require('chance')

// core
import config = require('./config')

export function generateAvatar (name: string): string {
  // use darker colors for better contrast
  const color: string = new Chance(name).color({
    format: 'hex',
    max_red: 150,
    max_green: 150,
    max_blue: 150
  })
  const letter: string = name.substring(0, 1).toUpperCase()

  let svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
  svg += '<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" height="96" width="96" version="1.1" viewBox="0 0 96 96">'
  svg += '<g>'
  svg += '<rect width="96" height="96" fill="' + color + '" />'
  svg += '<text font-size="64px" font-family="sans-serif" text-anchor="middle" fill="#ffffff">'
  svg += '<tspan x="48" y="72" stroke-width=".26458px" fill="#ffffff">' + letter + '</tspan>'
  svg += '</text>'
  svg += '</g>'
  svg += '</svg>'

  return svg
}

export function generateAvatarURL (name: string, email: string = '', big: boolean = true): string {
  let photo: string
  if (typeof email !== 'string') {
    email = '' + name + '@example.com'
  }
  name = encodeURIComponent(name)

  const hash = crypto.createHash('md5')
  hash.update(email.toLowerCase())
  const hexDigest: string = hash.digest('hex')

  if (email !== '' && config.allowGravatar) {
    photo = `https://cdn.libravatar.org/avatar/${hexDigest}?default=identicon`
    if (big) {
      photo += '&s=400'
    } else {
      photo += '&s=96'
    }
  } else {
    photo = config.serverURL + '/user/' + (name || email.substring(0, email.lastIndexOf('@')) || hexDigest) + '/avatar.svg'
  }
  return photo
}
