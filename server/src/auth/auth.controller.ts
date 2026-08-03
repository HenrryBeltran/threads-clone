import { Body, Controller, Injectable, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    async login(@Body() loginDto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(
            loginDto.username,
            loginDto.password,
            request.get('user-agent') ?? '',
            request.ip ?? '',
            response,
        );
    }
}
