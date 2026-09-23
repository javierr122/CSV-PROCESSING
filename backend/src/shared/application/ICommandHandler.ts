import { Either } from "../domain/Either";

export interface ICommandHandler<TCommand, TError, TResult> {
  execute(command: TCommand): Promise<Either<TError, TResult>>;
}
