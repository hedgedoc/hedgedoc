'use strict'

export const Environment = {
  development: 'development',
  production: 'production',
  test: 'test'
} as const

export const Permission: Record<string, string> = {
  freely: 'freely',
  editable: 'editable',
  limited: 'limited',
  locked: 'locked',
  protected: 'protected',
  private: 'private'
}
