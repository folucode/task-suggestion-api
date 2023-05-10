import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user.entity';
import { UsersModule } from './users.module';
import { TasksModule } from './tasks.module';
import { AuthModule } from './auth.module';
import { Task } from 'src/models/task.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Task],
      synchronize: false,
      autoLoadEntities: true,
      ssl: true,
    }),
    UsersModule,
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
