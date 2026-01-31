import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private sanitizeUser;
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
}
