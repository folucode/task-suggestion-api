import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users.module';
import { TasksModule } from './tasks.module';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.wcxfkxq.mongodb.net/?retryWrites=true&w=majority`,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '../models/*.entity.ts')],
      synchronize: true,
      autoLoadEntities: true,
      // ssl: true,
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
