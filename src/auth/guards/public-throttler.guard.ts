import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class PublicAwareThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const path = request?.route?.path;

        // 🔓 hard public routes
        if (
            path === '/auth/register' ||
            path === '/auth/login' ||
            path === '/public/widget-token' ||
            path === '/public/widget-config'
        ) {
            return true;
        }

        return false;
    }
}
