import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UsersModule } from './modules/users.module';
import { TasksModule } from './modules/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'task_suggestion',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
