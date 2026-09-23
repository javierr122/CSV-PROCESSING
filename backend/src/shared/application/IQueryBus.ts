import { Either } from "../domain/Either";
import { IQueryHandler } from "./IQueryHandler";

/**
 * Bus de queries en memoria (implementación simple, sin librería externa).
 */
export class QueryBus {
  private handlers = new Map<string, IQueryHandler<unknown, unknown, unknown>>();

  register(queryType: string, handler: IQueryHandler<unknown, unknown, unknown>): void {
    this.handlers.set(queryType, handler);
  }

  async execute<TQuery extends { type: string }, TError, TResult>(
    query: TQuery
  ): Promise<Either<TError, TResult>> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No hay handler registrado para la query "${query.type}"`);
    }
    return handler.execute(query) as Promise<Either<TError, TResult>>;
  }
}
