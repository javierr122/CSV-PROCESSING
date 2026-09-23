import { Query } from "../../cqrs/query";

export class GetCsvFileQuery implements Query {
  readonly type = "GetCsvFileQuery";

  constructor(public readonly id: string) {}
}
