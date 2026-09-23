import { FastifyInstance } from "fastify";
import { Container } from "../../../infrastructure/config/container";
import { CsvController } from "../controllers/csv.controller";

export async function csvRoutes(app: FastifyInstance, container: Container): Promise<void> {
  const controller = new CsvController(container);

  app.post("/csv-files", controller.upload);
  app.get("/csv-files", controller.list);
  app.get("/csv-files/:id", controller.getById);
}
