import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { IFileStorage, UploadFileParams } from "./IFileStorage";
import { env } from "../../../config/env";

/**
 * Implementación de IFileStorage sobre S3. Funciona igual contra AWS real
 * o contra LocalStack (basta con setear AWS_ENDPOINT_URL).
 * fileUrl = "s3://<bucket>/<key>"
 */
export class S3FileStorage implements IFileStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.AWS_ENDPOINT_URL,
      forcePathStyle: Boolean(env.AWS_ENDPOINT_URL),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucket = env.S3_BUCKET_NAME;
  }

  async ensureBucketExists(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  async upload(params: UploadFileParams): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
    );
    return `s3://${this.bucket}/${params.key}`;
  }

  async download(fileUrl: string): Promise<Buffer> {
    const key = fileUrl.replace(`s3://${this.bucket}/`, "");

    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const stream = result.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
