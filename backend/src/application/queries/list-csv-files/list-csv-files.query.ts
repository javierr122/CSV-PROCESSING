import { Query } from "../../cqrs/query";

export class ListCsvFilesQuery implements Query {
  readonly type = "ListCsvFilesQuery";

  constructor(
    public readonly status?: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0
  ) {}
}
