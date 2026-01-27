import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        firstName: string;
        lastName: string;
    }[]>;
    findByEmail(email: string): Promise<{
        id: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        password: string;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        firstName: string;
        lastName: string;
    } | null>;
}
