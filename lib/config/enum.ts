export interface Environment {
  development: string;
  production: string;
  test: string;
}

export const Environment: Environment = {
  development: 'development',
  production: 'production',
  test: 'test'
}

export interface Permission {
  freely: string;
  editable: string;
  limited: string;
  locked: string;
  protected: string;
  private: string;
}

export const Permission: Permission = {
  freely: 'freely',
  editable: 'editable',
  limited: 'limited',
  locked: 'locked',
  protected: 'protected',
  private: 'private'
}
