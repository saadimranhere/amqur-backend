import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles('SUPER_ADMIN', 'ADMIN')
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Roles('SUPER_ADMIN')
    @Post()
    create() {
        return { message: 'User creation disabled for now' };
    }
}
