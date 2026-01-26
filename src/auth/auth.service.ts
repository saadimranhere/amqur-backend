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

    async register(dto: RegisterDto) {
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: await bcrypt.hash(dto.password, 10),
                firstName: dto.firstName,
                lastName: dto.lastName,
                tenantId: dto.tenantId,
                locationId: dto.locationId,
                role: Role.ADMIN,
            },
        });

        const { password, ...safeUser } = user;

        return safeUser;
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
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

        const { password, ...safeUser } = user;

        return {
            accessToken: token,
            user: safeUser,
        };
    }
}
