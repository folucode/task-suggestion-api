import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignInDto } from 'src/dto/auth.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() userData: SignInDto) {
    return this.authService.signIn(userData.username, userData.password);
  }

  @Post('register')
  signUp(@Body() userData: SignInDto) {
    return this.authService.signUp(userData.username, userData.password);
  }
}
