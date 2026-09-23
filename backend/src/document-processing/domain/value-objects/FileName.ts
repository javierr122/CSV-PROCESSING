import { ValueObject } from "../../../shared/domain/ValueObject";
import { Either, left, right } from "../../../shared/domain/Either";

interface FileNameProps {
  value: string;
}

export class InvalidFileNameError extends Error {
  constructor(reason: string) {
    super(`Nombre de archivo inválido: ${reason}`);
    this.name = "InvalidFileNameError";
  }
}

/**
 * Value Object que valida que el archivo subido sea un .csv con
 * un nombre no vacío.
 */
export class FileName extends ValueObject<FileNameProps> {
  private constructor(props: FileNameProps) {
    super(props);
  }

  static create(raw: string): Either<InvalidFileNameError, FileName> {
    if (!raw || raw.trim().length === 0) {
      return left(new InvalidFileNameError("el nombre no puede estar vacío"));
    }
    if (!raw.toLowerCase().endsWith(".csv")) {
      return left(new InvalidFileNameError("el archivo debe tener extensión .csv"));
    }
    return right(new FileName({ value: raw }));
  }

  get value(): string {
    return this.props.value;
  }
}
