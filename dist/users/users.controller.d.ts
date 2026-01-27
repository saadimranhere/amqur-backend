import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    create(): {
        message: string;
    };
}
