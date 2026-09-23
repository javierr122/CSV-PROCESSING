export class CreateUploadCommand {
  readonly type = "CreateUploadCommand";

  constructor(
    public readonly fileName: string,
    public readonly fileContent: Buffer,
    public readonly userId: string
  ) {}
}
