import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
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
