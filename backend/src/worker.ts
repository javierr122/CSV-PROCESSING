import { container } from "./document-processing/infrastructure/dependency-injection/container";
import { FileProcessingWorker } from "./workers/FileProcessingWorker";

async function bootstrap(): Promise<void> {
  await container.bootstrapInfra();

  const worker = new FileProcessingWorker(container);
  await worker.start();
}

bootstrap().catch((error) => {
  console.error("Error al iniciar el worker:", error);
  process.exit(1);
});
