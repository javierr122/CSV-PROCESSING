import { FastifyReply, FastifyRequest } from "fastify";
import { Container } from "../../../infrastructure/config/container";
import { UploadCsvCommand } from "../../../application/commands/upload-csv/upload-csv.command";
import { GetCsvFileQuery } from "../../../application/queries/get-csv-file/get-csv-file.query";
import { ListCsvFilesQuery } from "../../../application/queries/list-csv-files/list-csv-files.query";
import {
  csvFileParamsSchema,
  listCsvFilesQuerySchema,
} from "../schemas/csv.schemas";
import { CsvFileDto } from "../../../application/dtos/csv-file.dto";
import { ListCsvFilesResult } from "../../../application/queries/list-csv-files/list-csv-files.handler";

export class CsvController {
  constructor(private readonly container: Container) {}

  upload = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const file = await request.file();
    if (!file) {
      reply.code(400).send({ message: "No se envió ningún archivo" });
      return;
    }
    if (!file.filename.toLowerCase().endsWith(".csv")) {
      reply.code(400).send({ message: "El archivo debe ser .csv" });
      return;
    }

    const buffer = await file.toBuffer();

    const command = new UploadCsvCommand(file.filename, buffer);
    const result = await this.container.commandBus.execute<
      UploadCsvCommand,
      CsvFileDto
    >(command);

    reply.code(201).send(result);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { id } = csvFileParamsSchema.parse(request.params);

    const query = new GetCsvFileQuery(id);
    const result = await this.container.queryBus.execute<GetCsvFileQuery, CsvFileDto>(
      query
    );

    reply.send(result);
  };

  list = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { status, limit, offset } = listCsvFilesQuerySchema.parse(request.query);

    const query = new ListCsvFilesQuery(status, limit, offset);
    const result = await this.container.queryBus.execute<
      ListCsvFilesQuery,
      ListCsvFilesResult
    >(query);

    reply.send(result);
  };
}
