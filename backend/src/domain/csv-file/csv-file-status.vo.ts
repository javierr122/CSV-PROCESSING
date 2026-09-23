export enum CsvFileStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export function isTerminalStatus(status: CsvFileStatus): boolean {
  return status === CsvFileStatus.COMPLETED || status === CsvFileStatus.FAILED;
}
