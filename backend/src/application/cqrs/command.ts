export interface Command {
  readonly type: string;
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}
