import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { IMessageConsumer } from "../../../shared/infrastructure/messaging/IMessageConsumer";
import { FileProcessingMessage } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import { env } from "../../../config/env";

export class SqsMessageConsumer implements IMessageConsumer {
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private polling = false;

  constructor() {
    this.client = new SQSClient({
      region: env.AWS_REGION,
      endpoint: env.AWS_ENDPOINT_URL,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.queueUrl = env.SQS_QUEUE_URL;
  }

  async consume(onMessage: (message: FileProcessingMessage) => Promise<void>): Promise<void> {
    this.polling = true;
    console.log(`[SQS] long-polling en ${this.queueUrl} (lotes de hasta 5, espera 10s)`);

    while (this.polling) {
      const response = await this.client.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 10,
        })
      );

      const messages = response.Messages ?? [];
      if (messages.length > 0) {
        console.log(`[SQS] ⬇ recibidos ${messages.length} mensaje(s) en este lote`);
      }

      for (const message of messages) {
        if (!message.Body) continue;

        try {
          const parsed = JSON.parse(message.Body) as FileProcessingMessage;
          await onMessage(parsed);

          if (message.ReceiptHandle) {
            await this.client.send(
              new DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle: message.ReceiptHandle })
            );
            console.log(
              `[SQS] ✓ mensaje confirmado y eliminado de la cola (ack) -> uploadId=${parsed.uploadId}`
            );
          }
        } catch (error) {
          // No se hace DeleteMessage: el mensaje vuelve a estar visible tras el
          // "visibility timeout" de SQS y se reintenta automáticamente (at-least-once).
          console.error("[SQS] ✗ error procesando mensaje, no se confirma (se reintentará):", error);
        }
      }
    }
  }

  stop(): void {
    this.polling = false;
  }
}
