import { FileProcessingMessage } from "./IMessagePublisher";

export interface IMessageConsumer {
  consume(onMessage: (message: FileProcessingMessage) => Promise<void>): Promise<void>;
}
