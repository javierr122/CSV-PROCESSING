import { promises as fs } from "fs";
import path from "path";
import { IFileStorage, UploadFileParams } from "./IFileStorage";

/**
 * Alternativa a S3FileStorage: guarda los archivos en el filesystem local
 * (carpeta uploads/). Útil si no se quiere levantar LocalStack.
 * Se activa con STORAGE_DRIVER=local en el .env.
 */
export class LocalFileStorage implements IFileStorage {
  private readonly baseDir = path.resolve(process.cwd(), "uploads");

  async upload(params: UploadFileParams): Promise<string> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const filePath = path.join(this.baseDir, params.key.replace(/\//g, "_"));
    await fs.writeFile(filePath, params.body);
    return `local://${filePath}`;
  }

  async download(fileUrl: string): Promise<Buffer> {
    const filePath = fileUrl.replace("local://", "");
    return fs.readFile(filePath);
  }
}
