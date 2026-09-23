import { Command, CommandHandler } from "./command";

/**
 * Bus de comandos simple en memoria. Cada comando se registra con un único handler.
 */
export class CommandBus {
  private handlers = new Map<string, CommandHandler<Command, unknown>>();

  register<TCommand extends Command, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>
  ): void {
    this.handlers.set(commandType, handler as CommandHandler<Command, unknown>);
  }

  async execute<TCommand extends Command, TResult = void>(
    command: TCommand
  ): Promise<TResult> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command "${command.type}"`);
    }
    return handler.execute(command) as Promise<TResult>;
  }
}
