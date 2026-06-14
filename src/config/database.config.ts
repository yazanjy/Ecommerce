import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  const uri = configService.get<string>('MONGO_URI');
  const dbName = configService.get<string>('MONGO_DB_NAME');

  if (!uri || !dbName) {
    throw new Error('Missing MongoDB configuration');
  }
  console.log('MongoDB URI:', uri);
  console.log('MongoDB DB Name:', dbName);

  return {
    uri,
    dbName,
    retryWrites: true,
    w: 'majority',
  };
};
