export class GetUploadResultsQuery {
  readonly type = "GetUploadResultsQuery";

  constructor(public readonly uploadId: string) {}
}
