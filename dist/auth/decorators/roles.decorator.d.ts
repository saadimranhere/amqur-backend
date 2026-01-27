export declare const ROLES_KEY = "roles";
export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
export declare const Roles: (...roles: AppRole[]) => import("@nestjs/common").CustomDecorator<string>;
