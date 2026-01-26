import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
    @Get()
    findAll() {
        return this.locationsService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN', 'ADMIN')
    @Post()
    create(@Body() dto: CreateLocationDto) {
        return this.locationsService.create(dto);
    }
}
