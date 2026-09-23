import { Either } from "../domain/Either";
import { ICommandHandler } from "./ICommandHandler";

/**
 * Bus de comandos en memoria (implementación simple, sin librería externa).
 * Cada tipo de comando se registra una única vez con su handler.
 */
export class CommandBus {
  private handlers = new Map<string, ICommandHandler<unknown, unknown, unknown>>();

  register(commandType: string, handler: ICommandHandler<unknown, unknown, unknown>): void {
    this.handlers.set(commandType, handler);
  }

  async execute<TCommand extends { type: string }, TError, TResult>(
    command: TCommand
  ): Promise<Either<TError, TResult>> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No hay handler registrado para el comando "${command.type}"`);
    }
    return handler.execute(command) as Promise<Either<TError, TResult>>;
  }
}
