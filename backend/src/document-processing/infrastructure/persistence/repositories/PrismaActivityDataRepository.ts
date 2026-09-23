import { prisma } from "../prisma.client";
import { IActivityDataRepository } from "../../../domain/repositories/IActivityDataRepository";
import { ActivityData } from "../../../domain/entities/ActivityData";

export class PrismaActivityDataRepository implements IActivityDataRepository {
  async saveMany(activityData: ActivityData[]): Promise<void> {
    if (activityData.length === 0) return;

    await prisma.activityData.createMany({
      data: activityData.map((item) => {
        const p = item.toPrimitives();
        return {
          id: p.id,
          uploadId: p.uploadId,
          category: p.category,
          amount: p.amount,
          unit: p.unit,
          date: p.date,
          createdAt: p.createdAt,
        };
      }),
    });
  }

  async findByUploadId(uploadId: string): Promise<ActivityData[]> {
    const records = await prisma.activityData.findMany({
      where: { uploadId },
      orderBy: { date: "asc" },
    });

    return records.map((record) =>
      ActivityData.reconstitute({
        id: record.id,
        uploadId: record.uploadId,
        category: record.category,
        amount: record.amount,
        unit: record.unit,
        date: record.date,
        createdAt: record.createdAt,
      })
    );
  }
}
