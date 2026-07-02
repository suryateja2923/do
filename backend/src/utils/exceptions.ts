export class HttpException extends Error {
  public status: number;
  public errors: any[] | null;

  constructor(status: number, message: string, errors: any[] | null = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', errors: any[] | null = null) {
    super(400, message, errors);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Resource Not Found') {
    super(404, message);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict') {
    super(409, message);
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: string = 'Business rule validation failed', errors: any[] | null = null) {
    super(422, message, errors);
  }
}

export class InternalServerException extends HttpException {
  constructor(message: string = 'Internal Server Error') {
    super(500, message);
  }
}
