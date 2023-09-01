import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignInDto, SignUpDto } from 'src/dto/auth.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(@Res() res: Response, @Body() userData: SignInDto) {
    try {
      const { data, statusCode } = await this.authService.signIn(
        userData.username,
        userData.password,
      );

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  }

  @Post('register')
  async signUp(@Res() res: Response, @Body() userData: SignUpDto) {
    try {
      const { statusCode, data } = await this.authService.signUp(userData);

      res.status(statusCode).json(data);
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  }
}
