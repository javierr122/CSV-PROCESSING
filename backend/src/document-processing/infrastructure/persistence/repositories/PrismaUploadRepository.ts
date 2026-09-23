import { prisma } from "../prisma.client";
import { IUploadRepository, ListUploadsFilters } from "../../../domain/repositories/IUploadRepository";
import { Upload } from "../../../domain/entities/Upload";
import { UploadStatus, UploadStatusEnum } from "../../../domain/value-objects/UploadStatus";

export class PrismaUploadRepository implements IUploadRepository {
  async save(upload: Upload): Promise<void> {
    const p = upload.toPrimitives();

    await prisma.upload.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        fileName: p.fileName,
        fileUrl: p.fileUrl,
        status: p.status,
        userId: p.userId,
        totalRows: p.totalRows,
        processedRows: p.processedRows,
        failedRows: p.failedRows,
        errorMessage: p.errorMessage,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
      update: {
        status: p.status,
        totalRows: p.totalRows,
        processedRows: p.processedRows,
        failedRows: p.failedRows,
        errorMessage: p.errorMessage,
        updatedAt: p.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Upload | null> {
    const record = await prisma.upload.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(filters: ListUploadsFilters): Promise<{ items: Upload[]; total: number }> {
    const where = filters.userId ? { userId: filters.userId } : {};

    const [records, total] = await Promise.all([
      prisma.upload.findMany({
        where,
        take: filters.limit,
        skip: (filters.page - 1) * filters.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.upload.count({ where }),
    ]);

    return { items: records.map(this.toDomain), total };
  }

  async countByStatus(userId?: string): Promise<Record<string, number>> {
    const where = userId ? { userId } : {};

    const grouped = await prisma.upload.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    });

    const result: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      FAILED: 0,
    };

    for (const group of grouped) {
      result[group.status] = group._count.status;
    }

    return result;
  }

  private toDomain(record: {
    id: string;
    fileName: string;
    fileUrl: string;
    status: string;
    userId: string;
    totalRows: number | null;
    processedRows: number | null;
    failedRows: number | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Upload {
    return Upload.reconstitute({
      id: record.id,
      fileName: record.fileName,
      fileUrl: record.fileUrl,
      status: UploadStatus.create(record.status as UploadStatusEnum),
      userId: record.userId,
      totalRows: record.totalRows,
      processedRows: record.processedRows,
      failedRows: record.failedRows,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
