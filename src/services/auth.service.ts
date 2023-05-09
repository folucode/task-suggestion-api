import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { hashPassword, isPasswordMatch } from 'src/utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      const registerUser = await this.signUp(username, password);

      return registerUser;
    }

    const passwordMatch = await isPasswordMatch(password, user.password);

    if (!passwordMatch) {
      return new UnauthorizedException();
    }

    const payload = { username: user.username, userId: user.userId };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (user) {
      return {
        status: 'failed',
        message: 'username already exists',
        data: [],
      };
    }

    const hash = await hashPassword(password);

    const userData = await this.usersService.create({
      username,
      password: hash,
    });

    return {
      access_token: await this.jwtService.signAsync({
        username: userData.username,
        userId: userData.userId,
      }),
      username,
    };
  }
}
