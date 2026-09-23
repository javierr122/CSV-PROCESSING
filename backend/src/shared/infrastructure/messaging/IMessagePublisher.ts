export interface FileProcessingMessage {
  uploadId: string;
}

export interface IMessagePublisher {
  publish(message: FileProcessingMessage): Promise<void>;
}
