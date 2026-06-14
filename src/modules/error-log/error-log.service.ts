// src/modules/error-log/error-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorLog } from './schemas/error-log.schema';

@Injectable()
export class ErrorLogService {
  constructor(
    @InjectModel(ErrorLog.name)
    private errorLogModel: Model<ErrorLog>,
  ) {}

  async logError(data: any) {
    try {
      await this.errorLogModel.create(data);
    } catch (error) {
      console.error('🚨 Failed to save error log to MongoDB:', error);
    }
  }
}