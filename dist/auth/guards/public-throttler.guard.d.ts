import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerModuleOptions, ThrottlerStorageService } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
export declare class PublicAwareThrottlerGuard extends ThrottlerGuard {
    constructor(options: ThrottlerModuleOptions, storageService: ThrottlerStorageService, reflector: Reflector);
    protected shouldSkip(context: ExecutionContext): Promise<boolean>;
}
