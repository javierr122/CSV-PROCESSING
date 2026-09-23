export interface Query {
  readonly type: string;
}

export interface QueryHandler<TQuery extends Query, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
