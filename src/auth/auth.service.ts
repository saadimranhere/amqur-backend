import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    // 🔒 single source of truth for safe user responses
    private sanitizeUser(user: any) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // ✅ CREATE FIRST SUPER ADMIN
    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password: await bcrypt.hash(dto.password, 10),

                firstName: dto.firstName,
                lastName: dto.lastName,

                tenantId: dto.tenantId,

                // 🔐 first account is always SUPER_ADMIN
                role: Role.SUPER_ADMIN,

                ...(dto.locationId && {
                    locationId: dto.locationId,
                }),
            },
        });

        return this.sanitizeUser(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(dto.password, user.password);

        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwt.sign({
            sub: user.id,
            tenantId: user.tenantId,
            locationId: user.locationId,
            role: user.role,
        });

        return {
            accessToken: token,
            user: this.sanitizeUser(user),
        };
    }
}
