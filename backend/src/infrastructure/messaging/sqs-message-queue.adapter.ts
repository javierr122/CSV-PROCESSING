import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  CreateQueueCommand,
  GetQueueUrlCommand,
} from "@aws-sdk/client-sqs";
import {
  MessageQueuePort,
  CsvProcessingMessage,
} from "../../application/ports/message-queue.port";
import { env } from "../config/env";

/**
 * Adaptador SQS. Funciona igual contra AWS real o contra LocalStack.
 */
export class SqsMessageQueueAdapter implements MessageQueuePort {
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

  async ensureQueueExists(queueName: string): Promise<void> {
    try {
      await this.client.send(new GetQueueUrlCommand({ QueueName: queueName }));
    } catch {
      await this.client.send(new CreateQueueCommand({ QueueName: queueName }));
    }
  }

  async publish(message: CsvProcessingMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
  }

  async consume(
    onMessage: (message: CsvProcessingMessage) => Promise<void>
  ): Promise<void> {
    this.polling = true;

    while (this.polling) {
      const response = await this.client.send(
        new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 10,
        })
      );

      for (const message of response.Messages ?? []) {
        if (!message.Body) continue;

        try {
          const parsed = JSON.parse(message.Body) as CsvProcessingMessage;
          await onMessage(parsed);

          if (message.ReceiptHandle) {
            await this.client.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              })
            );
          }
        } catch (error) {
          console.error("Error processing SQS message", error);
        }
      }
    }
  }

  stop(): void {
    this.polling = false;
  }
}
