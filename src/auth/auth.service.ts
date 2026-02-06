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

    // remove sensitive fields before returning user to client
    private sanitizeUser(user: any) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // build JWT in one place so payload stays consistent forever
    private buildToken(user: any) {
        return this.jwt.sign({
            sub: user.id,
            tenantId: user.tenantId,
            locationId: user.locationId,
            role: user.role,
        });
    }

    // REGISTER (used for creating admins)
    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existing) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                tenantId: dto.tenantId,
                role: Role.SUPER_ADMIN,
                ...(dto.locationId && { locationId: dto.locationId }),
            },
        });

        const token = this.buildToken(user);

        return {
            access_token: token,
            user: this.sanitizeUser(user),
        };
    }

    // LOGIN
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.password);

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.buildToken(user);

        return {
            access_token: token,
            user: this.sanitizeUser(user),
        };
    }
}
