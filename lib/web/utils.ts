'use strict'

import bodyParser = require('body-parser')

// create application/x-www-form-urlencoded parser
export const urlencodedParser = bodyParser.urlencoded({
  extended: false,
  limit: 1024 * 1024 * 10 // 10 mb
})

// create text/markdown parser
export const markdownParser = bodyParser.text({
  inflate: true,
  type: ['text/plain', 'text/markdown'],
  limit: 1024 * 1024 * 10 // 10 mb
})
