import { ValueObject } from "../../../shared/domain/ValueObject";

export enum UploadStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

interface UploadStatusProps {
  value: UploadStatusEnum;
}

/**
 * Value Object que encapsula el estado de un Upload y sus transiciones
 * válidas (PENDING -> PROCESSING -> COMPLETED | FAILED).
 */
export class UploadStatus extends ValueObject<UploadStatusProps> {
  private constructor(props: UploadStatusProps) {
    super(props);
  }

  static create(value: UploadStatusEnum): UploadStatus {
    return new UploadStatus({ value });
  }

  static pending(): UploadStatus {
    return UploadStatus.create(UploadStatusEnum.PENDING);
  }

  get value(): UploadStatusEnum {
    return this.props.value;
  }

  isPending(): boolean {
    return this.props.value === UploadStatusEnum.PENDING;
  }

  isProcessing(): boolean {
    return this.props.value === UploadStatusEnum.PROCESSING;
  }

  isTerminal(): boolean {
    return (
      this.props.value === UploadStatusEnum.COMPLETED ||
      this.props.value === UploadStatusEnum.FAILED
    );
  }
}
