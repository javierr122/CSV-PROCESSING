export interface UploadFileParams {
  key: string;
  body: Buffer;
  contentType?: string;
}

/**
 * Puerto de almacenamiento. La URL devuelta por upload() es lo que se
 * guarda en Upload.fileUrl y lo que download() espera recibir de vuelta.
 */
export interface IFileStorage {
  upload(params: UploadFileParams): Promise<string>;
  download(fileUrl: string): Promise<Buffer>;
}
