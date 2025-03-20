import { BaseError } from "./base-error";

export class ValidationError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} com ID ${id} não encontrado`
      : `${resource} não encontrado`;
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = "Não autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = "Acesso negado") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 409, "CONFLICT", details);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, "BAD_REQUEST", details);
  }
}
