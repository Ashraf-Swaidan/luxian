import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveException(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      statusCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      body.error = error;
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error?: string;
  } {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists',
        error: 'Conflict',
      };
    }

    const isProduction = process.env.NODE_ENV === 'production';

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction
        ? 'Internal server error'
        : exception instanceof Error
          ? exception.message
          : 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private fromHttpException(exception: HttpException): {
    statusCode: number;
    message: string | string[];
    error?: string;
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        message: exceptionResponse,
        error: HttpStatus[statusCode],
      };
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const body = exceptionResponse as Record<string, unknown>;
      const message = body.message ?? exception.message;
      const error =
        typeof body.error === 'string' ? body.error : HttpStatus[statusCode];

      return {
        statusCode,
        message: message as string | string[],
        error,
      };
    }

    return {
      statusCode,
      message: exception.message,
      error: HttpStatus[statusCode],
    };
  }
}
