// src/common/interceptors/i18n-response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // قراءة لغة المتصفح الحالية، وفي حال عدم وجودها نعتمد العربية كخيار افتراضي
    const lang = I18nContext.current()?.lang ?? 'ar';

    return next.handle().pipe(
      mergeMap(async (data: unknown) => {
        const response = data as Record<string, any>;

        // إذا كان الرد يحتوي على حقل message وهو عبارة عن نص (Key للترجمة)
        if (response?.message && typeof response.message === 'string') {
          const translateArgs = response.args || {};
          
          // استبدال كود الرسالة بالترجمة الفعلية من ملفات الـ JSON
          response.message = await this.i18n.translate(response.message, {
            lang,
            args: translateArgs,
          });
        }
        return response; // إرسال البيانات مترجمة وجاهزة للـ Frontend
      }),
    );
  }
}