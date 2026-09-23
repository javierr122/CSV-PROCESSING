import { parse } from "csv-parse";

export interface ParsedRow {
  category: string;
  amount: number;
  unit: string;
  date: Date;
}

export interface RowValidationError {
  row: number;
  errors: string[];
}

export interface CsvParseResult {
  validRows: ParsedRow[];
  invalidRows: RowValidationError[];
  totalRows: number;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Servicio de aplicación: parsea y valida el CSV según las reglas de la
 * prueba técnica:
 *  - Todas las columnas son obligatorias (category, amount, unit, date)
 *  - amount debe ser un número positivo
 *  - date debe ser una fecha válida en formato YYYY-MM-DD
 *  - category y unit no pueden estar vacíos
 *
 * Las filas inválidas no detienen el procesamiento: se reportan aparte
 * (failedRows) y las válidas se persisten igual.
 */
export class CsvParserService {
  async parse(fileContent: Buffer): Promise<CsvParseResult> {
    const records: Record<string, string>[] = await new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

      parser.on("data", (row: Record<string, string>) => rows.push(row));
      parser.on("error", reject);
      parser.on("end", () => resolve(rows));

      parser.write(fileContent);
      parser.end();
    });

    const validRows: ParsedRow[] = [];
    const invalidRows: RowValidationError[] = [];

    records.forEach((record, index) => {
      const errors = this.validateRow(record);

      if (errors.length > 0) {
        invalidRows.push({ row: index + 2, errors }); // +2: header + índice 1-based
        return;
      }

      validRows.push({
        category: record.category,
        amount: Number(record.amount),
        unit: record.unit,
        date: new Date(record.date),
      });
    });

    return { validRows, invalidRows, totalRows: records.length };
  }

  private validateRow(record: Record<string, string>): string[] {
    const errors: string[] = [];

    if (!record.category || record.category.trim().length === 0) {
      errors.push("category es obligatorio");
    }

    if (record.amount === undefined || record.amount === "") {
      errors.push("amount es obligatorio");
    } else {
      const amount = Number(record.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        errors.push("amount debe ser un número positivo");
      }
    }

    if (!record.unit || record.unit.trim().length === 0) {
      errors.push("unit es obligatorio");
    }

    if (!record.date || !DATE_REGEX.test(record.date) || Number.isNaN(Date.parse(record.date))) {
      errors.push("date debe tener formato YYYY-MM-DD válido");
    }

    return errors;
  }
}
