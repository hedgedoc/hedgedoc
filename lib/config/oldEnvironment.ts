import { toBooleanConfig } from './utils'

export const oldEnvironment = {
  debug: toBooleanConfig(process.env.DEBUG),
  dburl: process.env.DATABASE_URL,
  urlpath: process.env.URL_PATH,
  port: process.env.PORT
}
