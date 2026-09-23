import { Prisma, CsvFileStatus as PrismaCsvFileStatus } from "@prisma/client";
import { prisma } from "./prisma.client";
import {
  CsvFileRepository,
  CsvFileFilters,
} from "../../../domain/csv-file/csv-file.repository";
import { CsvFile } from "../../../domain/csv-file/csv-file.entity";
import { CsvFileStatus } from "../../../domain/csv-file/csv-file-status.vo";

export class PrismaCsvFileRepository implements CsvFileRepository {
  async save(csvFile: CsvFile): Promise<void> {
    const p = csvFile.toPrimitives();

    await prisma.csvFile.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        fileName: p.fileName,
        s3Key: p.s3Key,
        s3Bucket: p.s3Bucket,
        sizeInBytes: p.sizeInBytes,
        status: p.status as PrismaCsvFileStatus,
        rowCount: p.rowCount,
        errorMessage: p.errorMessage,
        uploadedBy: p.uploadedBy,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        processedAt: p.processedAt,
      },
      update: {
        status: p.status as PrismaCsvFileStatus,
        rowCount: p.rowCount,
        errorMessage: p.errorMessage,
        updatedAt: p.updatedAt,
        processedAt: p.processedAt,
      },
    });
  }

  async findById(id: string): Promise<CsvFile | null> {
    const record = await prisma.csvFile.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(filters: CsvFileFilters = {}): Promise<CsvFile[]> {
    const where: Prisma.CsvFileWhereInput = filters.status
      ? { status: filters.status as PrismaCsvFileStatus }
      : {};

    const records = await prisma.csvFile.findMany({
      where,
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
      orderBy: { createdAt: "desc" },
    });

    return records.map(this.toDomain);
  }

  async count(filters: CsvFileFilters = {}): Promise<number> {
    const where: Prisma.CsvFileWhereInput = filters.status
      ? { status: filters.status as PrismaCsvFileStatus }
      : {};

    return prisma.csvFile.count({ where });
  }

  private toDomain(record: {
    id: string;
    fileName: string;
    s3Key: string;
    s3Bucket: string;
    sizeInBytes: number;
    status: PrismaCsvFileStatus;
    rowCount: number | null;
    errorMessage: string | null;
    uploadedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    processedAt: Date | null;
  }): CsvFile {
    return CsvFile.reconstitute({
      id: record.id,
      fileName: record.fileName,
      s3Key: record.s3Key,
      s3Bucket: record.s3Bucket,
      sizeInBytes: record.sizeInBytes,
      status: record.status as unknown as CsvFileStatus,
      rowCount: record.rowCount,
      errorMessage: record.errorMessage,
      uploadedBy: record.uploadedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      processedAt: record.processedAt,
    });
  }
}
