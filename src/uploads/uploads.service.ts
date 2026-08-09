import { createHash, randomBytes } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import { FilePurpose, FileScanStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_BYTES = 10 * 1024 * 1024;

export interface MalwareScanner {
  scan(_: { storageKey: string; mimeType: string }): Promise<FileScanStatus>;
}

export class SkippedMalwareScanner implements MalwareScanner {
  async scan(): Promise<FileScanStatus> {
    return FileScanStatus.SKIPPED;
  }
}

@Injectable()
export class UploadsService {
  private readonly uploadRoot: string;

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    private readonly scanner: MalwareScanner = new SkippedMalwareScanner(),
  ) {
    this.uploadRoot = path.join(process.cwd(), 'uploads');
  }

  validateMime(mimeType: string): void {
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new BadRequestException(`MIME type not allowed: ${mimeType}`);
    }
  }

  validateSize(byteSize: number): void {
    if (byteSize <= 0 || byteSize > MAX_BYTES) {
      throw new BadRequestException(
        `File size must be between 1 byte and ${MAX_BYTES} bytes`,
      );
    }
  }

  private safeStorageKey(tenantId: string, originalName: string): string {
    const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, '');
    const token = randomBytes(16).toString('hex');
    const key = `${tenantId}/${token}${ext}`;
    const resolved = path.resolve(this.uploadRoot, key);
    if (!resolved.startsWith(path.resolve(this.uploadRoot))) {
      throw new BadRequestException('Invalid storage path');
    }
    return key;
  }

  async upload(params: {
    tenantId: string;
    locationId?: string | null;
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    purpose: FilePurpose;
    uploadedByUserId?: string | null;
    conversationId?: string | null;
  }) {
    this.validateMime(params.mimeType);
    this.validateSize(params.buffer.length);

    const storageKey = this.safeStorageKey(
      params.tenantId,
      params.originalName,
    );
    const checksumSha256 = createHash('sha256')
      .update(params.buffer)
      .digest('hex');

    const dir = path.dirname(path.join(this.uploadRoot, storageKey));
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(this.uploadRoot, storageKey), params.buffer);

    const scannedStatus = await this.scanner.scan({
      storageKey,
      mimeType: params.mimeType,
    });

    return this.prisma.fileObject.create({
      data: {
        tenantId: params.tenantId,
        locationId: params.locationId ?? null,
        storageKey,
        originalName: path.basename(params.originalName),
        mimeType: params.mimeType,
        byteSize: params.buffer.length,
        checksumSha256,
        purpose: params.purpose,
        scannedStatus,
        uploadedByUserId: params.uploadedByUserId ?? null,
        conversationId: params.conversationId ?? null,
      },
    });
  }
}
