import { Body, Controller, Get, Injectable, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { GetUserGuard } from './guards/get-user.guard';
import { AuthRequest } from './auth-request';
import { VerificationService } from './verification.service';

@Injectable()
@Controller('auth/verify-account')
@UseGuards(GetUserGuard, ThrottlerGuard)
@Throttle({ default: { limit: 3, ttl: 300_000 } })
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Post('/')
    async verifyAccount(
        @Body() dto: VerifyPinDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.verificationService.verifyAccount(request.user, dto.pin);
    }

    @Get('/token')
    async getToken(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.verificationService.getVerificationToken(request.user);
    }

    @Get('/resend')
    async resend(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.verificationService.resend(request.user);
    }
}
