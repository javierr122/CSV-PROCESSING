import { ActivityData } from "../entities/ActivityData";

export interface IActivityDataRepository {
  saveMany(activityData: ActivityData[]): Promise<void>;
  findByUploadId(uploadId: string): Promise<ActivityData[]>;
}
