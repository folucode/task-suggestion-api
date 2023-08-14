import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mongodb',
  entities: [join(__dirname, '../src/models/*.entity.ts')],
  //   ssl: true,
  migrations: [join(__dirname, '../migrations/*.ts')],
});
