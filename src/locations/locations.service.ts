import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.location.findMany();
    }

    create(data: CreateLocationDto) {
        return this.prisma.location.create({
            data,
        });
    }
}
