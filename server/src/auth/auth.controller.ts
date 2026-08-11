import { Body, Controller, HttpCode, Injectable, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
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

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 300_000 } })
    @Post('/login')
    @HttpCode(200)
    async login(@Body() loginDto: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(
            loginDto.username,
            loginDto.password,
            request.get('user-agent') ?? '',
            request.ip ?? '',
            response,
        );
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 600_000 } })
    @Post('/sign-up')
    async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.signUp(signUpDto, response);
    }

    @Post('/logout')
    @HttpCode(200)
    @UseGuards(SessionGuard)
    async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(request.sessionId!, response);
    }
}
