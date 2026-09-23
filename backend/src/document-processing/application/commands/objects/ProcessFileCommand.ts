export class ProcessFileCommand {
  readonly type = "ProcessFileCommand";

  constructor(public readonly uploadId: string) {}
}
