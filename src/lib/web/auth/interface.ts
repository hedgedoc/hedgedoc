import { Router } from 'express'

export interface AuthMiddleware {
  getMiddleware (): Router;
}
