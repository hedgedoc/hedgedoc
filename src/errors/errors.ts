export class NotInDBError extends Error {
  name = 'NotInDBError';
}

export class ClientError extends Error {
  name = 'ClientError';
}

export class PermissionError extends Error {
  name = 'PermissionError';
}
