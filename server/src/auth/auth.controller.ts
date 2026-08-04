import { Body, Controller, Injectable, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SessionGuard } from './guards/session.guard';
import { AuthRequest } from './auth-request';

@Injectable()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    async login(@Body() loginDto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        await this.authService.login(
            loginDto.username,
            loginDto.password,
            request.get('user-agent') ?? '',
            request.ip ?? '',
            response,
        );
    }

    @Post('/sign-up')
    async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) response: Response) {
        await this.authService.signUp(signUpDto, response);
    }

    @Post('/logout')
    @UseGuards(SessionGuard)
    async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        await this.authService.logout(request.sessionId!, response);
    }
}
