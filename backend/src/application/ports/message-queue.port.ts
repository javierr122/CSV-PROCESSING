export interface CsvProcessingMessage {
  csvFileId: string;
}

/**
 * Puerto de mensajería. Implementado por SQS (o LocalStack) en infraestructura.
 */
export interface MessageQueuePort {
  publish(message: CsvProcessingMessage): Promise<void>;
  consume(
    onMessage: (message: CsvProcessingMessage) => Promise<void>
  ): Promise<void>;
}

export const MESSAGE_QUEUE_PORT = Symbol("MessageQueuePort");
