import { BaseError } from "@p40/common/errors/base-error";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "@p40/common/errors/api-errors";

describe("Error Classes", () => {
  describe("BaseError", () => {
    it("should create a base error with default values", () => {
      const error = new BaseError("Erro teste");
      expect(error.message).toBe("Erro teste");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.details).toBeUndefined();
    });

    it("should create a base error with custom values", () => {
      const error = new BaseError("Erro teste", 400, "CUSTOM_ERROR", {
        field: "test",
      });
      expect(error.message).toBe("Erro teste");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("CUSTOM_ERROR");
      expect(error.details).toEqual({ field: "test" });
    });

    it("should format error to JSON correctly", () => {
      const error = new BaseError("Erro teste", 400, "CUSTOM_ERROR", {
        field: "test",
      });
      expect(error.toJSON()).toEqual({
        error: {
          message: "Erro teste",
          code: "CUSTOM_ERROR",
          details: { field: "test" },
        },
      });
    });
  });

  describe("ValidationError", () => {
    it("should create a validation error", () => {
      const error = new ValidationError("Dados inválidos", {
        field: "required",
      });
      expect(error.message).toBe("Dados inválidos");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.details).toEqual({ field: "required" });
    });
  });

  describe("NotFoundError", () => {
    it("should create a not found error with id", () => {
      const error = new NotFoundError("Usuário", "123");
      expect(error.message).toBe("Usuário com ID 123 não encontrado");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });

    it("should create a not found error without id", () => {
      const error = new NotFoundError("Usuário");
      expect(error.message).toBe("Usuário não encontrado");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create an unauthorized error with default message", () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe("Não autorizado");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });

    it("should create an unauthorized error with custom message", () => {
      const error = new UnauthorizedError("Token inválido");
      expect(error.message).toBe("Token inválido");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("ForbiddenError", () => {
    it("should create a forbidden error with default message", () => {
      const error = new ForbiddenError();
      expect(error.message).toBe("Acesso negado");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });

    it("should create a forbidden error with custom message", () => {
      const error = new ForbiddenError("Sem permissão");
      expect(error.message).toBe("Sem permissão");
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe("FORBIDDEN");
    });
  });

  describe("ConflictError", () => {
    it("should create a conflict error", () => {
      const error = new ConflictError("Recurso já existe", { id: "123" });
      expect(error.message).toBe("Recurso já existe");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe("CONFLICT");
      expect(error.details).toEqual({ id: "123" });
    });
  });

  describe("BadRequestError", () => {
    it("should create a bad request error", () => {
      const error = new BadRequestError("Requisição inválida", {
        field: "invalid",
      });
      expect(error.message).toBe("Requisição inválida");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.details).toEqual({ field: "invalid" });
    });
  });
});
