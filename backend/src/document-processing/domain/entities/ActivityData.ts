import { randomUUID } from "crypto";
import { AggregateRoot } from "../../../shared/domain/AggregateRoot";

export interface ActivityDataProps {
  id: string;
  uploadId: string;
  category: string;
  amount: number;
  unit: string;
  date: Date;
  createdAt: Date;
}

/**
 * Entidad que representa una fila válida del CSV procesado,
 * asociada a un Upload.
 */
export class ActivityData extends AggregateRoot<ActivityDataProps> {
  private constructor(props: ActivityDataProps) {
    super(props);
  }

  static create(params: {
    uploadId: string;
    category: string;
    amount: number;
    unit: string;
    date: Date;
  }): ActivityData {
    return new ActivityData({
      id: randomUUID(),
      uploadId: params.uploadId,
      category: params.category,
      amount: params.amount,
      unit: params.unit,
      date: params.date,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ActivityDataProps): ActivityData {
    return new ActivityData(props);
  }

  toPrimitives(): ActivityDataProps {
    return { ...this.props };
  }
}
