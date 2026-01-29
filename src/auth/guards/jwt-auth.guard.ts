import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const path = request.route?.path || '';
        const method = request.method;

        // ✅ HARD BYPASS AUTH ROUTES
        if (
            path === '/auth/register' ||
            path === '/auth/login' ||
            path.startsWith('/public')
        ) {
            return true;
        }

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing token');
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            request.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
