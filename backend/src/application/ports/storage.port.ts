export interface UploadFileParams {
  key: string;
  body: Buffer;
  contentType?: string;
}

/**
 * Puerto de almacenamiento de objetos. Implementado por S3 (o LocalStack) en infraestructura.
 */
export interface StoragePort {
  upload(params: UploadFileParams): Promise<{ bucket: string; key: string }>;
  download(key: string): Promise<Buffer>;
}

export const STORAGE_PORT = Symbol("StoragePort");
