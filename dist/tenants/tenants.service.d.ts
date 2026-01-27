import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(data: CreateTenantDto): import("@prisma/client").Prisma.Prisma__TenantClient<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
