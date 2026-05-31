import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

const ALLOWED_FOLDERS = new Set([
  'products',
  'categories',
  'collections',
  'banners',
  'uploads',
]);
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string | null;
  private readonly publicBaseUrl: string | null;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('R2_BUCKET_NAME') ?? null;
    const publicUrl = this.config
      .get<string>('R2_PUBLIC_URL')
      ?.replace(/\/$/, '');
    this.publicBaseUrl = publicUrl || null;

    if (
      accountId &&
      accessKeyId &&
      secretAccessKey &&
      this.bucket &&
      this.publicBaseUrl
    ) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'R2 uploads disabled — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL in api/.env',
      );
    }
  }

  isConfigured(): boolean {
    return this.client !== null && !!this.bucket && !!this.publicBaseUrl;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<{ url: string; key: string }> {
    if (
      !this.isConfigured() ||
      !this.client ||
      !this.bucket ||
      !this.publicBaseUrl
    ) {
      throw new ServiceUnavailableException(
        'Image uploads are not configured. Add Cloudflare R2 variables to api/.env (see api/CLOUDFLARE_R2_SETUP.md).',
      );
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('No file received');
    }

    const normalizedFolder = ALLOWED_FOLDERS.has(folder) ? folder : 'uploads';

    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }

    const ext = extname(file.originalname).toLowerCase();
    const safeExt =
      ext && /^\.(jpe?g|png|webp|gif)$/.test(ext)
        ? ext
        : mimeToExtension(file.mimetype);
    const key = `${normalizedFolder}/${randomUUID()}${safeExt}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    const url = `${this.publicBaseUrl}/${key}`;
    return { url, key };
  }
}

function mimeToExtension(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.bin';
  }
}
