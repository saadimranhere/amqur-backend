import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private sanitizeUser;
    private buildToken;
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
}
