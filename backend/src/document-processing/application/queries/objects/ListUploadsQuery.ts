export class ListUploadsQuery {
  readonly type = "ListUploadsQuery";

  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly userId?: string
  ) {}
}
