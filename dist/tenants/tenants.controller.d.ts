import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(dto: CreateTenantDto): import("@prisma/client").Prisma.Prisma__TenantClient<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        slug: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
