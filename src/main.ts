// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
/**
 * 🔍 دالة ذكية لفحص الأخطاء المتداخلة واستخراج أول رسالة خطأ واضحة ومقروءة للـ Frontend
 */
function extractFirstValidationMessage(
  error: ValidationError,
  visited: Set<ValidationError> = new Set()
): string | undefined {
  if (visited.has(error)) return undefined;
  visited.add(error);

  // الفحص الأولي داخل القيود المباشرة للحقل (Constraints)
  if (error.constraints && Object.keys(error.constraints).length > 0) {
    return Object.values(error.constraints)[0] as string;
  }

  // الغوص داخل الأبناء (في حال كانت البيانات عبارة عن مصفوفات أو كائنات متداخلة)
  if (error.children && error.children.length > 0) {
    for (const child of error.children) {
      const message = extractFirstValidationMessage(child, visited);
      if (message) return message;
    }
  }

  return undefined;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 🌐 1. إعدادات الـ CORS (جسر العبور الآمن الذي يسمح للـ Frontend بالاتصال بالسيرفر)
  app.enableCors({
    origin: true, // في مرحلة الإنتاج الفعلي، يتم استبداله برابط الـ Frontend الحقيقي
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true, // أساسي جداً لتمرير الكوكيز وجلسات العمل الآمنة
  });

  // 🍪 2. تفعيل قراءة الكوكيز (Cookie Parser)
  app.use(cookieParser());

  // 📝 3. مراقبة حالة اتصال قاعدة البيانات المونجو وطباعتها في الـ Terminal
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Cloud Atlas connected successfully!');
  });
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });

  // 🛡️ 4. نظام الـ Validation Pipe العالمي لتنظيف وتدقيق البيانات القادمة للسيرفر
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // تحويل البيانات تلقائياً للأنواع المطلوبة (مثل تحويل النص المكتوب برقم إلى Number حقيقي)
      whitelist: true, // إزالة أي حقول زائدة مرسلة ليست معرفة في الـ DTO لحماية السيرفر
      forbidNonWhitelisted: true, // رفض الطلب تماماً إذا أرسل المستخدم حقولاً مجهولة ومريبة
      exceptionFactory: (errors: ValidationError[]) => {
        if (!errors || errors.length === 0) {
          return new BadRequestException('VALIDATION_FAILED');
        }
        // استدعاء الدالة الذكية لاستخراج أول رسالة خطأ نظيفة
        const message = errors
          .map((error) => extractFirstValidationMessage(error))
          .find((msg) => msg);

        return new BadRequestException(message || 'VALIDATION_FAILED');
      },
    }),
  );

  // 🚀 5. إعدادات توثيق الـ API الفوري (Swagger UI)
  const appName = configService.get<string>('APP_NAME') || 'E-Commerce Backend';
  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(`The official API documentation for ${appName}`)
    .setVersion('1.0')
    // تجهيز نظام الـ Auth لطلب الـ Tokens وحماية الروابط لاحقاً في الـ Swagger
    .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // يمكنك الآن تصفح التوثيق عبر الرابط: http://localhost:4000/api/docs
  SwaggerModule.setup('api/docs', app, document);

  // 🔌 6. تشغيل السيرفر بناءً على البورت المحدد في ملف الـ .env
  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  
  console.log(`🚀 Server is flying high on: http://localhost:${port}`);
  console.log(`📖 Swagger API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();