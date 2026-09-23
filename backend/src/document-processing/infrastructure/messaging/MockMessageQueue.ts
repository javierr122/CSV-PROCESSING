import { IMessagePublisher } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import { IMessageConsumer } from "../../../shared/infrastructure/messaging/IMessageConsumer";
import { FileProcessingMessage } from "../../../shared/infrastructure/messaging/IMessagePublisher";

/**
 * Mock de cola de mensajes en memoria, alternativa a SQS/LocalStack.
 * Se activa con MESSAGE_QUEUE_DRIVER=mock en el .env. Útil si no se
 * quiere levantar LocalStack: el publisher y el consumer comparten el
 * mismo array en memoria (solo funciona si API y worker corren en el
 * mismo proceso; para procesos separados se recomienda SQS/LocalStack).
 */
export class MockMessageQueue implements IMessagePublisher, IMessageConsumer {
  private queue: FileProcessingMessage[] = [];
  private polling = false;

  async publish(message: FileProcessingMessage): Promise<void> {
    this.queue.push(message);
    console.log(
      `[MockQueue] mensaje encolado -> uploadId=${message.uploadId} (${this.queue.length} en cola)`
    );
  }

  private async poll(): Promise<FileProcessingMessage | null> {
    return this.queue.shift() ?? null;
  }

  async consume(onMessage: (message: FileProcessingMessage) => Promise<void>): Promise<void> {
    this.polling = true;
    let wasEmpty = true;

    while (this.polling) {
      const message = await this.poll();
      if (message) {
        console.log(
          `[MockQueue] entregando mensaje al worker -> uploadId=${message.uploadId} (quedan ${this.queue.length} en cola)`
        );
        wasEmpty = false;
        await onMessage(message);
      } else {
        if (!wasEmpty) {
          console.log("[MockQueue] cola vacía, esperando nuevos mensajes...");
          wasEmpty = true;
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  stop(): void {
    this.polling = false;
  }
}
