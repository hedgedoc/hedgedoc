import { response } from '../response'
import { errors } from '../errors'
import { Router } from 'express'

const BaseRouter = Router()

// get index
BaseRouter.get('/', response.showIndex)
// get 403 forbidden
BaseRouter.get('/403', function (req, res) {
  errors.errorForbidden(res)
})
// get 404 not found
BaseRouter.get('/404', function (req, res) {
  errors.errorNotFound(res)
})
// get 500 internal error
BaseRouter.get('/500', function (req, res) {
  errors.errorInternalError(res)
})

export { BaseRouter }
