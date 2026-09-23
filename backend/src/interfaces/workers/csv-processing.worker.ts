import { Container } from "../../infrastructure/config/container";
import { ProcessCsvCommand } from "../../application/commands/process-csv/process-csv.command";
import { CsvProcessingMessage } from "../../application/ports/message-queue.port";

/**
 * Worker consumidor de SQS: por cada mensaje recibido ejecuta el
 * ProcessCsvCommand a través del command bus.
 */
export class CsvProcessingWorker {
  constructor(private readonly container: Container) {}

  async start(): Promise<void> {
    console.log("CsvProcessingWorker escuchando la cola SQS...");

    await this.container.messageQueue.consume(async (message: CsvProcessingMessage) => {
      console.log(`Procesando CsvFile ${message.csvFileId}`);
      const command = new ProcessCsvCommand(message.csvFileId);
      await this.container.commandBus.execute(command);
      console.log(`CsvFile ${message.csvFileId} procesado`);
    });
  }
}
