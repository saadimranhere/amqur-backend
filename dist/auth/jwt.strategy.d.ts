import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly usersService;
    constructor(config: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        id: string;
        tenantId: string;
        locationId: string | null;
        role: import("@prisma/client").$Enums.Role;
        email: string;
        firstName: string;
        lastName: string;
    }>;
}
export {};
