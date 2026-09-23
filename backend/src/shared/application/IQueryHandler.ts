import { Either } from "../domain/Either";

export interface IQueryHandler<TQuery, TError, TResult> {
  execute(query: TQuery): Promise<Either<TError, TResult>>;
}
