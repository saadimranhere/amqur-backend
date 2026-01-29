import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type {
    ThrottlerModuleOptions,
    ThrottlerStorageService,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class PublicAwareThrottlerGuard extends ThrottlerGuard {
    constructor(
        options: ThrottlerModuleOptions,
        storageService: ThrottlerStorageService,
        reflector: Reflector,
    ) {
        super(options, storageService, reflector);
    }

    protected async shouldSkip(
        context: ExecutionContext,
    ): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        return !!isPublic;
    }
}
