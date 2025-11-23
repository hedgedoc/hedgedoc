'use strict'

const { rateLimit, ipKeyGenerator } = require('express-rate-limit')
const errors = require('../../errors')
const config = require('../../config')

const determineKey = (req) => {
  if (req.user) {
    return req.user.id
  }
  return ipKeyGenerator(req.header('cf-connecting-ip') || req.ip)
}

// limits requests to user endpoints (login, signup) to 10 requests per 5 minutes
const userEndpoints = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  keyGenerator: determineKey,
  handler: (req, res) => errors.errorTooManyRequests(res)
})

// limits the amount of requests to the new note endpoint per 5 minutes based on configuration
const newNotes = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: config.rateLimitNewNotes,
  keyGenerator: determineKey,
  handler: (req, res) => errors.errorTooManyRequests(res)
})

module.exports = {
  userEndpoints,
  newNotes
}
