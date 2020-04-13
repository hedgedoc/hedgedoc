import { User } from './models'

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
