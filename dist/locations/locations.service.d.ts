import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
export declare class LocationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        tenantId: string;
        address: string | null;
        phone: string | null;
        inventoryFeedUrl: string | null;
        inventoryFeedType: import("@prisma/client").$Enums.InventoryFeedType | null;
    }[]>;
    create(data: CreateLocationDto): import("@prisma/client").Prisma.Prisma__LocationClient<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        tenantId: string;
        address: string | null;
        phone: string | null;
        inventoryFeedUrl: string | null;
        inventoryFeedType: import("@prisma/client").$Enums.InventoryFeedType | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
