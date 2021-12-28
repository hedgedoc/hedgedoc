'use strict'

exports.isSQLite = function isSQLite (sequelize) {
  return sequelize.options.dialect === 'sqlite'
}

exports.getImageMimeType = function getImageMimeType (imagePath) {
  const fileExtension = /[^.]+$/.exec(imagePath)

  switch (fileExtension[0].toLowerCase()) {
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

exports.useUnless = function excludeRoute (paths, middleware) {
  return function (req, res, next) {
    if (paths.includes(req.path)) {
      return next()
    }
    return middleware(req, res, next)
  }
}

exports.isLocalhostAddress = function isLocalhostAddress(req) {
  const regexRange0To255 = /^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;
  const clientIP = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const testString = String(clientIP);
  if (testString === 'localhost' ||
    testString === '::1') {
    return true;
  }
  if (!testString.startsWith('127.') ||
    testString === '127.255.255.255' ||
    testString === '127.0.0.0') {
    return false;
  }
  const splits = testString.split('.');
  return splits.length === 4 &&
    splits[0] === '127' &&
    regexRange0To255.test(splits[1]) &&
    regexRange0To255.test(splits[2]) &&
    regexRange0To255.test(splits[3]);
};
