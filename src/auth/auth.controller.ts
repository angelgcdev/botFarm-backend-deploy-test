import { Request } from 'express';

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
// import { LoginResponse } from './types/login-response.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Para validar acceso a rutas protegidas
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    const user = req.user;
    console.log('User decifrado de Bearer token:', user);
    return { ok: true, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('register')
  async registerUser(@Body() body: CreateAuthDto) {
    return this.authService.registerUser(body);
  }

  @Get()
  findAllUsers() {
    return this.authService.findAllUsers();
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updateUser(+id, updateAuthDto);
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    return this.authService.removeUser(+id);
  }
}
