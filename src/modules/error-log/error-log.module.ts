// src/modules/error-log/error-log.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorLog, ErrorLogSchema } from './schemas/error-log.schema';
import { ErrorLogService } from './error-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ErrorLog.name, schema: ErrorLogSchema },
    ]),
  ],
  providers: [ErrorLogService],
  exports: [ErrorLogService], // 🔑 مهم جداً لتستطيع الفلاتر استدعاء الخدمة
})
export class ErrorLogModule {}