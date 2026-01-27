import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    create(): {
        message: string;
    };
}
