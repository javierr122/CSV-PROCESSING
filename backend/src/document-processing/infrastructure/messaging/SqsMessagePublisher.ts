import {
  SQSClient,
  SendMessageCommand,
  CreateQueueCommand,
  GetQueueUrlCommand,
} from "@aws-sdk/client-sqs";
import { IMessagePublisher } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import { FileProcessingMessage } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import { env } from "../../../config/env";

export class SqsMessagePublisher implements IMessagePublisher {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

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

  async publish(message: FileProcessingMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
    console.log(`[SQS] ⬆ mensaje publicado -> uploadId=${message.uploadId}`);
  }
}
