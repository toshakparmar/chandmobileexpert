import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';

const LoginSchema = z.object({
  idToken: z.string().min(1, 'ID Token is required'),
});

const AdminLoginSchema = z.object({
  phone: z.string().regex(/^(\+91[\s-]?)?[0-9]{10}$/, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

class LoginDto extends createZodDto(LoginSchema) {}
class AdminLoginDto extends createZodDto(AdminLoginSchema) {}

@Controller('auth')
@UsePipes(ZodValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() body: LoginDto) {
    return this.authService.loginWithFirebaseToken(body.idToken, false);
  }

  @Post('admin/firebase-login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async adminFirebaseLogin(@Body() body: LoginDto) {
    return this.authService.loginWithFirebaseToken(body.idToken, true);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async adminLogin(@Body() body: AdminLoginDto) {
    return this.authService.loginAdmin(body.phone, body.otp);
  }
}
