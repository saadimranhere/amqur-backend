import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { KnowledgeVisibility } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CurrentUser,
  resolveTenantId,
  assertStaffRole,
} from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { KnowledgeService } from './knowledge.service';

class CreateKnowledgeDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;
}

@Controller('knowledge')
@UseGuards(RolesGuard)
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @Post('documents')
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateKnowledgeDocumentDto,
    @Query('tenantId') tenantId?: string,
  ) {
    assertStaffRole(user);
    const scoped = resolveTenantId(user, tenantId);
    const locationId =
      user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
        ? dto.locationId
        : (user.locationId ?? dto.locationId);
    return this.knowledge.createDocument({
      tenantId: scoped,
      locationId,
      sourceId: dto.sourceId,
      title: dto.title,
      content: dto.content,
      canonicalUrl: dto.canonicalUrl,
      visibility: KnowledgeVisibility.STAFF,
    });
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @Get('documents')
  list(
    @CurrentUser() user: AuthUser,
    @Query('tenantId') tenantId?: string,
    @Query('locationId') locationId?: string,
  ) {
    assertStaffRole(user);
    const scoped = resolveTenantId(user, tenantId);
    const loc =
      user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
        ? locationId
        : (user.locationId ?? locationId);
    return this.knowledge.listDocuments(scoped, loc ?? undefined);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')
  @Post('documents/:id/publish')
  publish(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    assertStaffRole(user);
    const scoped = resolveTenantId(user, tenantId);
    return this.knowledge.publishDocument(scoped, id, user.sub);
  }
}
