import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  async findAvailableVehicles(params: {
    tenantId: string;
    locationId?: string | null;
    query?: string;
  }) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId: params.tenantId,
        locationId: params.locationId ?? undefined,
        status: 'AVAILABLE',
      },
      take: 10,
    });
  }
}
