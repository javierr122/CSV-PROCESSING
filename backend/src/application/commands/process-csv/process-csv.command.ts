import { Command } from "../../cqrs/command";

export class ProcessCsvCommand implements Command {
  readonly type = "ProcessCsvCommand";

  constructor(public readonly csvFileId: string) {}
}
