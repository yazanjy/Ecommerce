// src/common/filters/multer-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MulterError } from 'multer';
import type { Response } from 'express';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // حماية السيرفر من الملفات الضخمة التي تستهلك الباندويث والمساحة السحابية
    if (exception.code === 'LIMIT_FILE_SIZE') {
      return response.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً! الحد الأقصى المسموح به هو 1 ميغابايت.',
      });
    }

    return response.status(400).json({
      success: false,
      message: exception.message,
    });
  }
}