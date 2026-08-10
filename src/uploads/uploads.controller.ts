import {
  Body,
  Controller,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { FilePurpose } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CurrentUser,
  resolveTenantId,
  assertStaffRole,
  type AuthUser,
} from '../common/decorators/current-user.decorator';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';
import { UploadsService } from './uploads.service';

class UploadMetaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  originalName!: string;

  @IsString()
  mimeType!: string;

  /** Base64 payload — kept small by MIME/size guards (not for large media). */
  @IsString()
  @MinLength(1)
  contentBase64!: string;

  @IsIn(Object.values(FilePurpose))
  purpose!: FilePurpose;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}

@Controller('uploads')
@UseGuards(RolesGuard)
export class UploadsController {
  constructor(
    private readonly uploads: UploadsService,
    private readonly flags: FeatureFlagsService,
  ) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @Post()
  async upload(@CurrentUser() user: AuthUser, @Body() dto: UploadMetaDto) {
    assertStaffRole(user);
    const tenantId = resolveTenantId(user);
    const resolved = await this.flags.resolve(tenantId, user.locationId);
    if (resolved.uploads !== true) {
      throw new BadRequestException('Uploads are disabled for this tenant');
    }
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    return this.uploads.upload({
      tenantId,
      locationId: user.locationId ?? dto.locationId ?? null,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      buffer,
      purpose: dto.purpose,
      uploadedByUserId: user.sub,
      conversationId: dto.conversationId ?? null,
    });
  }
}
