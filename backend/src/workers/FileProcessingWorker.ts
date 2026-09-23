import { Container } from "../document-processing/infrastructure/dependency-injection/container";
import { ProcessFileCommand } from "../document-processing/application/commands/objects/ProcessFileCommand";
import { FileProcessingMessage } from "../shared/infrastructure/messaging/IMessagePublisher";

/**
 * Worker que consume mensajes de la cola (SQS/LocalStack o el mock en
 * memoria, según MESSAGE_QUEUE_DRIVER) y ejecuta ProcessFileCommand por
 * cada uno.
 */
export class FileProcessingWorker {
  constructor(private readonly container: Container) {}

  async start(): Promise<void> {
    console.log(`[Worker] listo. Driver de cola: ${process.env.MESSAGE_QUEUE_DRIVER ?? "sqs"}. Esperando mensajes...`);

    await this.container.messageConsumer.consume(async (message: FileProcessingMessage) => {
      const receivedAt = Date.now();
      console.log(`[Worker] ⬇ mensaje recibido de la cola -> uploadId=${message.uploadId}`);

      const result = await this.container.commandBus.execute(
        new ProcessFileCommand(message.uploadId)
      );

      const elapsedMs = Date.now() - receivedAt;

      if (result.isLeft()) {
        // El mensaje NO se re-encola automáticamente en este mock/consumer:
        // se registra el error y se sigue con el siguiente mensaje.
        console.error(
          `[Worker] ✗ uploadId=${message.uploadId} terminó con error tras ${elapsedMs}ms:`,
          result.value.message
        );
        return;
      }

      console.log(`[Worker] ✓ uploadId=${message.uploadId} procesado y confirmado en ${elapsedMs}ms`);
    });
  }
}
