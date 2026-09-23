/**
 * Puerto para parsear el contenido de un CSV. Implementado en infraestructura.
 */
export interface CsvParserPort {
  countRows(fileContent: Buffer): Promise<number>;
}

export const CSV_PARSER_PORT = Symbol("CsvParserPort");
