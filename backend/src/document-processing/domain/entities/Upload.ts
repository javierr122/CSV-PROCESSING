import { randomUUID } from "crypto";
import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { UploadStatus, UploadStatusEnum } from "../value-objects/UploadStatus";

export interface UploadProps {
  id: string;
  fileName: string;
  fileUrl: string;
  status: UploadStatus;
  userId: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root del bounded context document-processing.
 * Representa un archivo CSV subido y el ciclo de vida de su procesamiento.
 */
export class Upload extends AggregateRoot<UploadProps> {
  private constructor(props: UploadProps) {
    super(props);
  }

  static create(params: {
    fileName: string;
    fileUrl: string;
    userId: string;
  }): Upload {
    const now = new Date();
    return new Upload({
      id: randomUUID(),
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      status: UploadStatus.pending(),
      userId: params.userId,
      totalRows: null,
      processedRows: null,
      failedRows: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UploadProps): Upload {
    return new Upload(props);
  }

  markAsProcessing(): void {
    this.props.status = UploadStatus.create(UploadStatusEnum.PROCESSING);
    this.props.updatedAt = new Date();
  }

  markAsCompleted(params: { totalRows: number; processedRows: number; failedRows: number }): void {
    this.props.status = UploadStatus.create(UploadStatusEnum.COMPLETED);
    this.props.totalRows = params.totalRows;
    this.props.processedRows = params.processedRows;
    this.props.failedRows = params.failedRows;
    this.props.errorMessage = null;
    this.props.updatedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.props.status = UploadStatus.create(UploadStatusEnum.FAILED);
    this.props.errorMessage = errorMessage;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  toPrimitives(): {
    id: string;
    fileName: string;
    fileUrl: string;
    status: UploadStatusEnum;
    userId: string;
    totalRows: number | null;
    processedRows: number | null;
    failedRows: number | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.props.id,
      fileName: this.props.fileName,
      fileUrl: this.props.fileUrl,
      status: this.props.status.value,
      userId: this.props.userId,
      totalRows: this.props.totalRows,
      processedRows: this.props.processedRows,
      failedRows: this.props.failedRows,
      errorMessage: this.props.errorMessage,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
