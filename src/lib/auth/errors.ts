export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export class SoftLockError extends Error {
  statusCode = 403;

  constructor(
    message = 'Workspace is in read-only mode. Please upgrade to continue.',
  ) {
    super(message);
    this.name = 'SoftLockError';
  }
}

export class SuspendedError extends Error {
  statusCode = 403;

  constructor(message = 'Workspace has been suspended. Contact support.') {
    super(message);
    this.name = 'SuspendedError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}
