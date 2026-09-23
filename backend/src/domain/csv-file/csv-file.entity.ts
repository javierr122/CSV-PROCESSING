import { randomUUID } from "crypto";
import { CsvFileStatus } from "./csv-file-status.vo";
import { InvalidCsvFileError } from "../shared/errors/domain-error";

export interface CsvFileProps {
  id: string;
  fileName: string;
  s3Key: string;
  s3Bucket: string;
  sizeInBytes: number;
  status: CsvFileStatus;
  rowCount: number | null;
  errorMessage: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
}

/**
 * Aggregate root del dominio "CsvFile".
 * Encapsula las invariantes y transiciones de estado válidas de un archivo CSV.
 */
export class CsvFile {
  private constructor(private props: CsvFileProps) {}

  static create(params: {
    fileName: string;
    s3Key: string;
    s3Bucket: string;
    sizeInBytes: number;
    uploadedBy?: string | null;
  }): CsvFile {
    if (!params.fileName.toLowerCase().endsWith(".csv")) {
      throw new InvalidCsvFileError("El archivo debe tener extensión .csv");
    }
    if (params.sizeInBytes <= 0) {
      throw new InvalidCsvFileError("El archivo no puede estar vacío");
    }

    const now = new Date();
    return new CsvFile({
      id: randomUUID(),
      fileName: params.fileName,
      s3Key: params.s3Key,
      s3Bucket: params.s3Bucket,
      sizeInBytes: params.sizeInBytes,
      status: CsvFileStatus.PENDING,
      rowCount: null,
      errorMessage: null,
      uploadedBy: params.uploadedBy ?? null,
      createdAt: now,
      updatedAt: now,
      processedAt: null,
    });
  }

  static reconstitute(props: CsvFileProps): CsvFile {
    return new CsvFile(props);
  }

  markAsProcessing(): void {
    this.props.status = CsvFileStatus.PROCESSING;
    this.props.updatedAt = new Date();
  }

  markAsCompleted(rowCount: number): void {
    this.props.status = CsvFileStatus.COMPLETED;
    this.props.rowCount = rowCount;
    this.props.errorMessage = null;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  markAsFailed(errorMessage: string): void {
    this.props.status = CsvFileStatus.FAILED;
    this.props.errorMessage = errorMessage;
    this.props.processedAt = new Date();
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  toPrimitives(): CsvFileProps {
    return { ...this.props };
  }
}
