import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = typeof exceptionResponse === 'object' && exceptionResponse
        ? (exceptionResponse as any).message
        : exceptionResponse;
      response.status(status).json({
        statusCode: status,
        message: this.normalizeMessage(message, status)
      });
      return;
    }

    const maybeError = exception as { message?: unknown; details?: unknown; hint?: unknown };
    const message = exception instanceof Error
      ? exception.message
      : typeof maybeError?.message === 'string'
        ? maybeError.message
        : 'No se pudo completar la acción';
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: this.normalizeMessage(message, HttpStatus.BAD_REQUEST)
    });
  }

  private normalizeMessage(message: unknown, status: number) {
    const text = Array.isArray(message) ? message.join('. ') : String(message || '');
    const lower = text.toLowerCase();

    if (lower.includes('foreign key') || lower.includes('23503')) {
      return 'No se puede borrar porque hay datos relacionados';
    }
    if (lower.includes('duplicate key') || lower.includes('23505')) {
      return 'Ya existe un registro con esos datos';
    }
    if (lower.includes('must be') || lower.includes('should not') || lower.includes('property ')) {
      return 'Revisa los campos obligatorios y los valores introducidos.';
    }
    if (lower.includes('invalid input syntax') || lower.includes('nan')) {
      return 'Hay un valor numérico no válido.';
    }
    if (!text.trim()) {
      if (status === HttpStatus.FORBIDDEN || status === HttpStatus.UNAUTHORIZED) return 'No tienes permisos para hacer esta acción.';
      if (status === HttpStatus.NOT_FOUND) return 'No se encontró el recurso solicitado.';
      return 'No se pudo completar la acción.';
    }

    return text.replace(/^Error:\s*/i, '');
  }
}
