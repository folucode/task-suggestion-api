import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: 5432,
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [join(__dirname, '../src/models/*.{ts}')],
  ssl: true,
  migrations: [join(__dirname, '/migrations/*.{ts}')],
});
