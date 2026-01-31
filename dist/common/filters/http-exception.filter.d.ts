import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
