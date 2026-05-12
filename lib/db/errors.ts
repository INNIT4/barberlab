export const PG_ERROR_CODES = {
  EXCLUSION_VIOLATION: "23P01",
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  CHECK_VIOLATION: "23514",
} as const;

type PgErrorCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];

export class DatabaseError extends Error {
  code: PgErrorCode | string;

  constructor(message: string, code: PgErrorCode | string) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
  }
}

export class ExclusionViolationError extends DatabaseError {
  constructor(message = "Conflicto de horario") {
    super(message, PG_ERROR_CODES.EXCLUSION_VIOLATION);
    this.name = "ExclusionViolationError";
  }
}

export class UniqueViolationError extends DatabaseError {
  constructor(message = "Registro duplicado") {
    super(message, PG_ERROR_CODES.UNIQUE_VIOLATION);
    this.name = "UniqueViolationError";
  }
}

export function isPgError(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === code
  );
}

export function isExclusionViolation(err: unknown): boolean {
  return isPgError(err, PG_ERROR_CODES.EXCLUSION_VIOLATION);
}

export function isUniqueViolation(err: unknown): boolean {
  return isPgError(err, PG_ERROR_CODES.UNIQUE_VIOLATION);
}
