import { Controller, Get, Post, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  // public bootstrap endpoint
  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  // later will be protected again
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }
}
