/**
 * Patrón Either para manejo de errores sin excepciones.
 * Representa un resultado que puede ser un error (Left) o un éxito (Right).
 *
 * Se usa en todos los Command/Query Handlers en lugar de try/catch +
 * throw, para que los errores sean parte explícita de la firma del
 * método y el caller esté obligado a manejarlos.
 */
export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }
}

export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }
}

export type Either<L, R> = Left<L, R> | Right<L, R>;

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
