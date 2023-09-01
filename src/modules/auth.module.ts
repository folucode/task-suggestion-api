import { Module } from '@nestjs/common';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UsersModule } from './users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthGateway } from 'src/gateways/auth.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.APP_EXPIRES },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGateway],
  exports: [AuthService],
})
export class AuthModule {}
