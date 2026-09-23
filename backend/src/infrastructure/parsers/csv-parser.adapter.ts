import { parse } from "csv-parse";
import { CsvParserPort } from "../../application/ports/csv-parser.port";

export class CsvParserAdapter implements CsvParserPort {
  async countRows(fileContent: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

      parser.on("data", () => {
        rowCount += 1;
      });
      parser.on("error", reject);
      parser.on("end", () => resolve(rowCount));

      parser.write(fileContent);
      parser.end();
    });
  }
}
