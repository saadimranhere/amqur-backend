import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            locationId: string | null;
            role: import("@prisma/client").$Enums.Role;
            email: string;
            firstName: string;
            lastName: string;
        };
    }>;
}
