// src/common/filters/i18n-exception.filter.ts
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';
import { ErrorLogService } from '../modules/error-log/error-log.service';

@Injectable()
@Catch()
export class I18nValidationFilter implements ExceptionFilter {
  // حقن خدمة الـ ErrorLog التي بنيناها لتسجيل الكراشات فوراً في السحاب
  constructor(
    private readonly i18n: I18nService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. تحديد لغة الطلب من الـ Header لتوفير تجربة مستخدم متناسقة
    const acceptLanguage = (request.headers['accept-language'] as string)?.split(',')[0]?.trim() || 'ar';
    const lang = acceptLanguage.startsWith('ar') ? 'ar' : 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | undefined;
    let errorCode = 'UNEXPECTED';
    let details: any = undefined;

    // 2. إذا كان الخطأ قادماً من كود تملكه NestJS (مثل خطأ مدخلات DTO أو 404)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, any>;
        if (typeof r.message === 'string') {
          message = r.message;
        } else if (Array.isArray(r.message) && r.message.length) {
          message = r.message[0]; // اقتناص أول رسالة خطأ تهم الزبون
        } else {
          message = exception.message;
        }
        details = r;
      }
      errorCode = typeof message === 'string' ? message.split('.').pop() || 'ERROR' : 'ERROR';
    } 
    // 3. إذا كان الخطأ كراش أو عطل برمي غير متوقع في السيرفر
    else if (exception instanceof Error) {
      message = exception.message;
      details = exception.stack;
    }

    if (!message) {
      message = 'common.errors.UNEXPECTED';
    }

    let translateArgs: Record<string, any> = {};
    if (typeof details === 'object' && details !== null && details.args) {
      translateArgs = details.args;
    }

    // 4. محرك الترجمة الذكي: يترجم النصوص فقط إذا كانت تبدأ بـ 'common.' ومقسمة بنقاط
    if (typeof message === 'string' && message.includes('.') && message.startsWith('common.')) {
      try {
        const translatedMessage = (await this.i18n.translate(message, { lang })) as string;
        
        // استبدال المتغيرات الديناميكية مثل {{username}} داخل نص الترجمة
        if (translateArgs && Object.keys(translateArgs).length > 0) {
          const translatedArgs: Record<string, string> = {};
          for (const [key, value] of Object.entries(translateArgs)) {
            if (typeof value === 'string' && value.startsWith('common.') && value.includes('.')) {
              translatedArgs[key] = (await this.i18n.translate(value, { lang })) as string;
            } else {
              translatedArgs[key] = String(value);
            }
          }
          let finalMessage = translatedMessage;
          for (const [key, translatedValue] of Object.entries(translatedArgs)) {
            finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), translatedValue);
          }
          message = finalMessage;
        } else {
          message = translatedMessage;
        }
      } catch (e) {
        console.warn('⚠️ Translation fallback active for:', message);
      }
    }

    // 5. 🚀 تدوين الخطأ تلقائياً في السحاب لكي يظهر لك في MongoDB Compass فوراً!
    await this.errorLogService.logError({
      message: message,
      stack: typeof details === 'string' ? details : JSON.stringify(details),
      path: request.url,
      method: request.method,
      statusCode: status,
      userId: (request as any)?.user?.id || null,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // 6. تشكيل الرد النهائي الـ Clean للـ Frontend
    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      errorCode,
      message,
    });
  }
}