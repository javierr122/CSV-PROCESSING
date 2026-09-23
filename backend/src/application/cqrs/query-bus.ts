import { Query, QueryHandler } from "./query";

/**
 * Bus de queries simple en memoria. Cada query se registra con un único handler.
 */
export class QueryBus {
  private handlers = new Map<string, QueryHandler<Query, unknown>>();

  register<TQuery extends Query, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>
  ): void {
    this.handlers.set(queryType, handler as QueryHandler<Query, unknown>);
  }

  async execute<TQuery extends Query, TResult>(query: TQuery): Promise<TResult> {
    const handler = this.handlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query "${query.type}"`);
    }
    return handler.execute(query) as Promise<TResult>;
  }
}
