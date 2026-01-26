import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateLocationDto {
    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    @Matches(/^[a-z0-9-]+$/i, {
        message: 'slug must be alphanumeric with dashes only',
    })
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    address?: string;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    phone?: string;
}
