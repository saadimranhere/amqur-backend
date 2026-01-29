import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    @Get()
    findAll() {
        return this.locationsService.findAll();
    }

    @Roles('SUPER_ADMIN', 'ADMIN')
    @Post()
    create(@Body() dto: CreateLocationDto) {
        return this.locationsService.create(dto);
    }
}
