import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
}
