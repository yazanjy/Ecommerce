// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import path from 'path';

// إعدادات التكوين وقاعدة البيانات
import appConfig from './config/app.config';
import { mongoConfig } from './config/database.config';

// الفلاتر والـ Interceptors العالمية
import { I18nValidationFilter } from './filters/i18n-exception.filter';
import { I18nResponseInterceptor } from './common/interceptors/i18n-response.interceptor';

// الموديولات الأساسية المتاحة حالياً في مشروعك الجديد
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ErrorLogModule } from './modules/error-log/error-log.module';

@Module({
  imports: [
    // 1. تفعيل المهام المجدولة (Cron Jobs) في السيرفر
    ScheduleModule.forRoot(),

    // 2. إعداد متغيرات البيئة بشكل عالمي
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // 3. الاتصال الديناميكي الآمن بقاعدة بيانات المونجو السحابية
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongoConfig,
    }),

    // 4. نظام الترجمة العالمي (i18n) مع تحديد مسار ملفات الـ JSON
    I18nModule.forRoot({
      fallbackLanguage: 'ar', // اللغة الافتراضية للمتجر
      loaderOptions: {
        path: path.join(process.cwd(), 'src/i18n/'),
        watch: true, // تحديث الترجمة فوراً عند تعديل ملفات الـ JSON دون إعادة تشغيل السيرفر
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] }, // قراءة اللغة من الرابط ?lang=ar
        { use: HeaderResolver, options: ['accept-language'] }, // قراءة اللغة من طلب الـ Frontend
        AcceptLanguageResolver,
      ],
    }),

    // 5. موديولات البيزنس الحالية (تنمو تدريجياً كلما أنشأنا موديول جديد)
    UsersModule,
    ErrorLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🔥 تفعيل فلتر الأخطاء والترجمة والتدوين السحابي العالمي
    {
      provide: APP_FILTER,
      useClass: I18nValidationFilter,
    },
    // 🔥 تفعيل مفسر ومترجم الردود الناجحة العالمي للـ Frontend
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nResponseInterceptor,
    },
  ],
})
export class AppModule {}