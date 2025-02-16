export type ExceptionData = {
  message?: string;
  systemMessage?: string;
  statusCode?: number;
  errorType?: string;
  relevant?: boolean;
};

export class BaseException extends Error {
  public statusCode: number;
  public errorType: string;
  public relevant: boolean;

  constructor({
    message = "Erro inesperado",
    systemMessage,
    statusCode = 500,
    errorType = "INTERNAL_ERROR",
    relevant = false,
  }: ExceptionData) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.relevant = relevant;
  }
}

export class FailException extends BaseException {
  constructor(data: ExceptionData = {}) {
    super({
      ...data,
      errorType: "FAIL",
      statusCode: data.statusCode || 400,
    });
  }
}

export class TooManyRequestsException extends FailException {
  constructor(data: ExceptionData = {}) {
    super({
      ...data,
      errorType: "TOO_MANY_REQUESTS",
      statusCode: 429,
      message: data.message || "Limite de tentativas atingido",
    });
  }
}
