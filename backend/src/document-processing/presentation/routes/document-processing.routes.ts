import { FastifyInstance } from "fastify";
import { Container } from "../../infrastructure/dependency-injection/container";
import { CreateUploadController } from "../controllers/CreateUploadController";
import { GetUploadByIdController } from "../controllers/GetUploadByIdController";
import { ListUploadsController } from "../controllers/ListUploadsController";
import { GetUploadResultsController } from "../controllers/GetUploadResultsController";

export async function documentProcessingRoutes(
  app: FastifyInstance,
  container: Container
): Promise<void> {
  const createUpload = new CreateUploadController(container);
  const getUploadById = new GetUploadByIdController(container);
  const listUploads = new ListUploadsController(container);
  const getUploadResults = new GetUploadResultsController(container);

  app.post("/api/v1/uploads", createUpload.handle);
  app.get("/api/v1/uploads", listUploads.handle);
  app.get("/api/v1/uploads/:id", getUploadById.handle);
  app.get("/api/v1/uploads/:id/results", getUploadResults.handle);
}
