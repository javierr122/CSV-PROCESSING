import { Command } from "../../cqrs/command";

export class UploadCsvCommand implements Command {
  readonly type = "UploadCsvCommand";

  constructor(
    public readonly fileName: string,
    public readonly fileContent: Buffer,
    public readonly uploadedBy?: string
  ) {}
}
